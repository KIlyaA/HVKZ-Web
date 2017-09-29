import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { observable } from 'mobx';

import { inject } from '../../utils/di';
import { FileUploadTask } from '../../domain/file-upload-task';
import { GalleryStore } from '../../domain/gallery-store';
import { CommonStore } from '../../domain/common-store';

import { ModalWindow } from '../../modal-window';
import { UploadView } from './upload-view';

const TextArea = styled.textarea.attrs({
  placeholder: 'Подпись к изображению (не более 100 символов)',
  maxLength: 100,
  rows: 7
})`
  box-sizing: border-box;
  width: 100%;
  padding: 4px;
  font-size: 14px;
  line-height: 24px;

  resize: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  outline: none;
`;

interface Props {
  task: FileUploadTask;
  onDone: () => void;
  
  className?: string;
}

@observer
class UploadDialog extends React.Component<Props> {

  private textInput: HTMLTextAreaElement;

  @observable
  private hasError: boolean = false;

  @inject(GalleryStore)
  private galleryStore: GalleryStore;

  @inject(CommonStore)
  private commonStore: CommonStore;
  
  public render(): JSX.Element | null {
    console.log(this.galleryStore);
    const { task, className } = this.props;

    return (
      <ModalWindow onClose={this.handleClose}>
        <form className={className} onSubmit={this.addToGallery}>
          <div className="left">
            <UploadView task={task}/>
          </div>
          <div className="right">
            <h3 className="title">Загрузка изображения</h3>
            {this.hasError || this.props.task.isFailed &&
              <span className="error">При загрузке произошла ошибка</span>}
            <TextArea innerRef={el => this.textInput = el!}/>
            <div className="actions">
              <span className="cancel" onClick={this.handleClose}>Отмена</span>
              <button
                className="upload"
                type="submit"
                disabled={this.hasError || this.props.task.isFailed}
              >
                Загрузить
              </button>
            </div>
          </div>
        </form>
      </ModalWindow>
    );
  }

  private addToGallery = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (this.props.task.isLoaded) {
      try {
        const userId = this.commonStore.currentUserId;
        const url = this.props.task.downloadUrl;
        const description = this.textInput.value;

        await this.galleryStore.addToGallery(userId, url, description);
        this.props.onDone();
      } catch (error) {
        this.hasError = true;
        this.props.task.cancel();
      }
    }
  }

  private handleClose = () => {
    this.props.task.cancel();
    this.props.onDone();
  }
}

const StyledUploadDialog = styled(UploadDialog)`
  display: flex;
  flex-flow: row nowrap;

  .left {
    position: relative;
    width: 46%;

    &:before {
      box-sizing: border-box;
      min-height: 100%;
      display: block;
      content: "";
      width: 100%;      
      padding-top: 100%;
    }

    ${UploadView} {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }

  .right {
    width: 46%;
    padding: 12px 4%;

    > .error {
      font-size: 14px;
      color: #e74c3c;
    }

    > .title {
      margin: 0;
      font-size: 18px;
      font-weight: normal;
      line-height: 24px;
      margin-bottom: 12px;
      color: #555;
    }

    > .actions {
      padding: 8px 0;
      display: flex;
      flex-flow: row nowrap;

      > .cancel {
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
      }

      > .upload {
        font-size: 18px;
        margin-left: auto;
        border: none;
        background: none;
        outline: none;
        color: #e2bc52;
        font-weight: bold;
        cursor: pointer;        
      }
    }
  }
`;

export { StyledUploadDialog as UploadDialog };
