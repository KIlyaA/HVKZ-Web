import * as React from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';

import { inject } from '../utils/di';
import { UsersStore } from '../domain/users-store';
import { GalleryStore } from '../domain/gallery-store';
import { FileUploadTask } from '../domain/file-upload-task';
import { ImageUploader } from '../utils/image-uploader';
import { CommonStore } from '../domain/common-store';
import { User, Photo } from '../domain/models';

import { Header } from './header';
import { UploadDialog } from './upload/upload-dialog';
import { UploadButton } from './upload/upload-button';
import { Gallery } from './gallery';

interface Props {
  userId: number;
  className?: string;
}

@observer
class ProfileView extends React.Component<Props> {

  @observable.ref
  private user: User | null | undefined;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GalleryStore)
  private galleryStore: GalleryStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  @inject(ImageUploader)
  private imageUploader: ImageUploader;

  @observable.ref
  private uploadTask: FileUploadTask | null = null;

  @computed
  private get gallery(): Photo[] | null | undefined {
    if (this.user) {
      return this.galleryStore.galleries.get(this.user.uid);
    }
    
    return null;
  }

  @action
  public componentWillMount(): void {
    const userId = this.props.userId;
    this.user = this.usersStore.users.get(userId);

    if (this.galleryStore.galleries.get(userId) === void 0) {
      this.galleryStore.loadGallery(userId);
    }
  }

  @action
  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.userId !== this.props.userId) {
      this.user = this.usersStore.users.get(nextProps.userId);
    }
  }

  public render(): JSX.Element | null {
    if (this.user === void 0 || this.user === null) {
      return null;
    }

    return (
      <div className={this.props.className}>
        <Header user={this.user}/>
        <h3 className="gallery-title">Галерея</h3>
        {this.gallery && <Gallery items={this.gallery} onAdditionalClick={this.handleDeletePhoto}/>}
        {this.props.userId === this.commonStore.currentUserId && 
          <UploadButton onChange={this.handleUpload}/>}
        {this.uploadTask !== null &&
          <UploadDialog onDone={this.handleUploadDone} task={this.uploadTask}/>}
      </div>
    );
  }

  private handleUpload = async (event: React.FormEvent<HTMLInputElement>) => {
    const file = Array.from(event.currentTarget.files || [])[0];

    if (file) {
      this.uploadTask = await this.imageUploader.upload(file);
      event.currentTarget.value = '';
    }
  }

  private handleUploadDone = () => {
    this.uploadTask = null;
  }

  private handleDeletePhoto = (index: number) => {
    if (this.user && this.user.uid === this.commonStore.currentUserId) {
      if (confirm('Удалить фотографию?')) {
        this.galleryStore.removeFromGallery(this.user.uid, index);
      }
    }
  }
}

const StyledProfileView = styled(ProfileView)`
  position: relative;

  .gallery-title {
    padding: 24px 15px 16px 15px;
    margin: 0;
    color: #c0c0c0;
    font-size: 18px;
    font-weight: normal;
  }
`;

export { StyledProfileView as ProfileView };
