import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';

import { Chat, Message } from '../domain/chat';
import { FileUploadTask } from '../domain/file-upload-task';
import { inject } from '../utils/di';
import { ImageUploader } from '../utils/image-uploader';
import send from './send.svg';
import { UploadButton } from './upload-button';
import { UploadView } from './upload-view';

const Wrapper = styled.div`
  box-sizing: border-box;
  background: #fff; 
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.14);
`;

const Form = styled.form`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
`;

const MessageInput = styled.textarea`
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
  forwaded: Message[];
}

@observer
export class Input extends React.Component<InputProps> {

  private messageInput: HTMLTextAreaElement;

  @observable
  private messageInputRows: number = 1;

  @observable.shallow
  private uploads: FileUploadTask[] = [];

  @inject(ImageUploader)
  private imageUploader: ImageUploader;

  public componentWillUnmount() {
    this.uploads.forEach(uploadTask => this.handleCancelUpload(uploadTask));
  }

  public render(): JSX.Element {
    const { forwaded } = this.props;
    return (
     <Wrapper>
      {forwaded.length !== 0 && (<div>{forwaded.length}</div>)}
      {this.uploads.length !== 0 && (
        <Images>{this.uploads.map(upload => this.renderUploadView(upload))}</Images>
      )}
      <Form onSubmit={this.handleSubmit}>
        <UploadButton onChange={this.uploadImages}/>
        <MessageInput
          rows={this.messageInputRows}
          placeholder="Введите сообщение..."
          onChange={this.handleChange}
          innerRef={ref => this.messageInput = ref}
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
    this.sendMessage();
  }

  @action
  private handleChange = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const chat = this.props.chat;
    if (chat.canSendStatus) {
      chat.composing();
    }

    // e.currentTarget.rows = 1;
    // tslint:disable-next-line:no-bitwise
    // const newRows = ~~(e.currentTarget.scrollHeight / 24);
    this.messageInputRows = 1;
  }

  @action
  private uploadImages = async (e: React.FormEvent<HTMLInputElement>) => {
    const images = Array.from(e.currentTarget.files || []);
    const uploads = JSON.parse(localStorage.getItem('upload_tasks')!) || [];

    images.forEach(image => {
      console.log(image.name);
      const uploadTask = this.imageUploader.upload(image);
      this.uploads.push(uploadTask);
      uploads.push(uploadTask.ref);
    });

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

  private sendMessage() {
    const text = this.messageInput.value.trim();
    let isAllLoaded = true;

    for (let i = 0; i < this.uploads.length; i++) {
      if (!this.uploads[i].isLoaded) {
        isAllLoaded = false;
        break;
      }
    }

    if (!!text || (this.uploads.length !== 0 && isAllLoaded)) {
      this.props.chat.sendMessage(text, this.uploads.map(task => task.downloadUrl));
      this.messageInput.value = '';

      this.uploads = [];
      localStorage.removeItem('upload_tasks');
    }
  }
}
