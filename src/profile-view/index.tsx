import * as React from 'react';
import styled from 'styled-components';
import { observable, action, computed } from 'mobx';
import { observer } from 'mobx-react';

import { PhotoSwipeGallery } from 'react-photoswipe';

import { inject } from '../utils/di';
import { UsersStore } from '../domain/users-store';
import { GalleryStore, Photo } from '../domain/gallery-store';
import { FileUploadTask } from '../domain/file-upload-task';
import { ImageUploader } from '../utils/image-uploader';
import { CommonStore } from '../domain/common-store';
import { User } from '../domain/models';

import { Header } from './header';
import { UploadDialog } from './upload/upload-dialog';
import { UploadButton } from './upload/upload-button';

const galleryOptions = {
  history: false,
  shareEl: false,
  showHideOpacity: true,
  getThumbBoundsFn: false
};

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
        {this.gallery && <PhotoSwipeGallery
          items={this.gallery.map(p => ({
            src: p.url.replace('&amp;', '&'),
            title: p.description,
            w: 0,
            h: 0
          }))}
          options={galleryOptions}
          thumbnailContent={this.getThumbnailContent}
          gettingData={this.onGettingData}
        />}
        {this.props.userId === this.commonStore.currentUserId && 
          <UploadButton onChange={this.handleUpload}/>}
        {this.uploadTask !== null &&
          <UploadDialog onDone={this.handleUploadDone} task={this.uploadTask}/>}
      </div>
    );
  }

  private getThumbnailContent = (photo: { src: string, title: string }) => {
    return (
      <div className="thumb">
        <div className="image" style={{ backgroundImage: `url(${photo.src})` }}/>
        <img src={photo.src} alt={photo.title} />
      </div>
    );
  }

  private onGettingData = (gallery, index, item) => {
    if (item.w === 0 || item.h === 0) {
      console.log(index);
      let image: HTMLImageElement | null = new Image();
      image.src = item.src;

      item.w = image.naturalWidth;
      item.h = image.naturalHeight;

      image.remove();
      item = null;
    }
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
}

const StyledProfileView = styled(ProfileView)`
  position: relative;

  .pswp-thumbnails {
    display: flex;
    flex-flow: row wrap;
    width: 100%;
  }

  .pswp-thumbnail {
    position: relative;
    width: 33.3333%;
    box-sizing: border-box;    
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;

    &:before {
      display: block;
      content: "";
      width: 100%;      
      padding-top: 100%;
    }

    &:nth-child(3n) {
      border-right: none;
    }

    > .thumb {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;

      .image {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;

        background-size: cover;
        background-position: center;
      }

      img {
        visibility: hidden;
        width: 100%;
        height: 100%;
      }
    }
  }

  .gallery-title {
    padding: 24px 15px 16px 15px;
    margin: 0;
    color: #c0c0c0;
    font-size: 18px;
    font-weight: normal;
  }
`;

export { StyledProfileView as ProfileView };
