import * as React from 'react';
import { observer } from 'mobx-react';
import { PhotoSwipe } from 'react-photoswipe';

import { inject } from './utils/di';
import { UIStore } from './domain/ui-store';

@observer
export class LightBox extends React.Component {

  @inject(UIStore)
  private uiStore: UIStore;

  public render(): JSX.Element | null {
    if (this.uiStore.currentImages.length === 0) {
      return null;
    }

    const galleryOptions = {
      history: true,
      shareEl: false,
      showHideOpacity: true,
      getThumbBoundsFn: false,
      index: this.uiStore.indexImage
    };

    return (
      <PhotoSwipe
        items={this.uiStore.currentImages.map(photo => ({
          src: photo.url.replace('&amp;', '&'),
          w: 0,
          h: 0,
          title: photo.description
        }))}
        options={galleryOptions}
        gettingData={this.onGettingData}
        isOpen={this.uiStore.isOpenGallery}
        onClose={this.handleClose}
      />
    );
  }

  private handleClose = () => {
    this.uiStore.isOpenGallery = false;
  }

  private onGettingData = (gallery, index, item) => {
    if (item.w === 0 || item.h === 0) {
      let image: HTMLImageElement | null = new Image();
      image.src = item.src;

      item.w = image.naturalWidth;
      item.h = image.naturalHeight;

      image.remove();
      item = null;
    }
  }
}
