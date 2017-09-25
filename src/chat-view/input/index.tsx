import { Connection } from '../../domain/connection';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import Textarea from 'react-textarea-autosize';

import { inject } from '../../utils/di';
import { Chat, FWD } from '../../domain/chat';
import { UIStore } from '../../domain/ui-store';
import { FileUploadTask } from '../../domain/file-upload-task';
import { ImageUploader } from '../../utils/image-uploader';
import { declOfNum } from '../../utils/decl-of-num';

import { UploadButton } from './upload-button';
import { UploadView } from './upload-view';
import send from './send.svg';

const Wrapper = styled.div`
  box-sizing: border-box;
  background: #fff; 
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.14);

  > .fwd {
    margin: 0;
    box-sizing: border-box;
    border-left: 1px solid #f2f2f2;
    padding: 6px 12px;
    font-size: 14px;
    color: #555;
  }
`;

const Form = styled.form`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
`;

const MessageInput = styled(Textarea)`
  border: none;
  outline: none;
  padding: 12px 12px;
  flex: 1;
  font-size: 16px;
  line-height: 24px;

  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
`;

const SendButton = styled.button`
  border: none;
  outline: none;

  width: 24px;
  height: 24px;

  box-sizing: content-box;
  cursor: pointer;
  padding: 12px 10px;

  background-color: #fff;
  background-size: 24px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${send});
`;

const Images = styled.div`
  padding: 0 10px;
  max-height: 138px;
  overflow-x: auto;
  overflow-y: hidden;

  ${UploadView} {
    margin-top: 5px;
    margin-bottom: 5px;
  }

  ${UploadView}:not(:last-child) {
    margin-right: 10px;
  }
`;

interface InputProps {
  chat: Chat;
}

@observer
export class Input extends React.Component<InputProps> {

  @observable
  private messageText: string = '';

  @observable.shallow
  private uploads: FileUploadTask[] = [];

  @inject(Connection)
  private connection: Connection;

  @inject(ImageUploader)
  private imageUploader: ImageUploader;

  @inject(UIStore)
  private uiStore: UIStore;

  public componentWillUnmount(): void {
    this.uploads.forEach(uploadTask => this.handleCancelUpload(uploadTask));
    this.uiStore.selectedMessages.clear();
  }

  public componentWillReceiveProps(nextProps: InputProps): void {
    if (nextProps.chat !== this.props.chat) {
      this.uploads.forEach(uploadTask => this.handleCancelUpload(uploadTask));
      this.uiStore.selectedMessages.clear();
      this.messageText = '';
    }
  }

  public render(): JSX.Element {
    const forwaded = this.uiStore.selectedMessages;
    return (
     <Wrapper>
      {forwaded.size !== 0 && (
        <div className="fwd">В ответ на {forwaded.size} 
          {declOfNum(forwaded.size, ['сообщение', 'сообщения', 'сообщений'])}</div>
      )}
      {this.uploads.length !== 0 && (
        <Images>{this.uploads.map(upload => this.renderUploadView(upload))}</Images>
      )}
      <Form onSubmit={this.handleSubmit} disabled={!this.connection.isConnected}>
        <UploadButton onChange={this.uploadImages} disabled={!this.connection.isConnected}/>
        <MessageInput
          maxRows={3}
          placeholder="Введите сообщение..."
          onChange={this.handleChange}
          value={this.messageText}
        />
        <SendButton/>
      </Form>
     </Wrapper>
    );
  }

  private renderUploadView = (uploadTask: FileUploadTask): JSX.Element => {
    return (
      <UploadView
        key={uploadTask.ref}
        task={uploadTask}
        onCancel={task => this.handleCancelUpload(task)}
      />
    );
  }

  private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!this.connection.isConnected) {
      alert('Отправка сообщения невозможна по причине отсутствия подключения');
      return;
    }
    
    this.sendMessage();
  }

  @action
  private handleChange = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (this.props.chat.canSendStatus) {
      this.props.chat.composing();
    }

    this.messageText = e.currentTarget.value;
  }

  @action
  private uploadImages = async (e: React.FormEvent<HTMLInputElement>) => {
    const images = Array.from(e.currentTarget.files || []);
    const uploads = JSON.parse(localStorage.getItem('upload_tasks')!) || [];

    for (let i = 0; i < images.length; i++) {
      let image = images[i];      
      const uploadTask = await this.imageUploader.upload(image);
      this.uploads.push(uploadTask);
      uploads.push(uploadTask.ref);
    }

    localStorage.setItem('upload_tasks', JSON.stringify(uploads));
  }

  @action
  private handleCancelUpload = (task: FileUploadTask) => {
    let uploads = JSON.parse(localStorage.getItem('upload_tasks')!) || [];
    this.uploads = this.uploads.filter(otask => otask.ref !== task.ref);
    uploads = uploads.filter(ref => ref !== task.ref);
    task.cancel();

    localStorage.setItem('upload_tasks', JSON.stringify(uploads));
  }

  @action
  private sendMessage(): void {
    const text = this.messageText.trim();
    let isAllLoaded = true;

    for (let i = 0; i < this.uploads.length; i++) {
      if (!this.uploads[i].isLoaded) {
        isAllLoaded = false;
        break;
      }
    }

    if (!!text || (this.uploads.length !== 0 && isAllLoaded)) {
      const images = this.uploads.map(task => task.downloadUrl);
      const forwaded: FWD[] = [];
      
      this.uiStore.selectedMessages.forEach(message => {
        forwaded.push({
          images: [],
          message: message.body,
          sender: message.senderId,
          timestamp: message.timestamp
        });
      });

      this.props.chat.sendMessage(text, images, forwaded.sort((a, b) => a.timestamp - b.timestamp));
      this.messageText = '';

      this.uiStore.selectedMessages.clear();
      this.uploads = [];
      localStorage.removeItem('upload_tasks');
    }
  }
}
