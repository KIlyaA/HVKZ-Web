import { FileUploadTask } from '../domain/file-upload-task';
import * as Firebase from 'firebase';

import { inject, singleton } from './di';
import { SessionStore } from '../domain/session-store';

const MAX_SIZE = 1200;

@singleton(ImageUploader)
export class ImageUploader {

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @inject(Firebase.storage)
  private storageService: Firebase.storage.Storage;

  public async upload(file: File) {
    const rootRef = this.storageService.ref();
    const random = Math.floor(Math.random() * 100);
    const timestamp = Math.floor(Date.now() / 1000);
    const imageName = this.sessionStore.currentUserId + '_' + random + '_' + timestamp;
    const imageRef = rootRef.child('photos/' + imageName);

    console.log('parse');
    let imageDataUrl = await this.getDataUrlFromBlob(file);    
    const image = new Image();
    image.src = imageDataUrl;

    await new Promise((resolve) => {
      const listener = () => {
        image.removeEventListener('load', listener);
        resolve();
      };

      image.addEventListener('load', listener);
    });

    console.log(image.naturalWidth, image.naturalHeight);    
    const newSize = this.getNewSize(image.naturalWidth, image.naturalHeight);
    if (newSize.width !== image.naturalWidth || newSize.height !== image.naturalHeight) {

      console.log(newSize.width, newSize.height);
  
      const canvas = document.createElement('canvas');
      canvas.width = newSize.width;
      canvas.height = newSize.height;
      
      const context = canvas.getContext('2d');
  
      if (context) {
        context.drawImage(image, 0, 0, newSize.width, newSize.height);
        imageDataUrl = canvas.toDataURL('image/jpeg');
      }
    }

    const uploadTask = imageRef.putString(imageDataUrl, Firebase.storage.StringFormat.DATA_URL);
    return new FileUploadTask(file, uploadTask);
  }

  public delete(paths: string[]) {
    console.log(paths);
  }

  private getNewSize(width: number, height: number) {
    let newWidth = 0;
    let newHeight = 0;

    if (width > height) {
      const ratio = width / MAX_SIZE;
      newWidth = MAX_SIZE;
      newHeight = Math.ceil(height / ratio);
    } else if (height > width) {
      const ratio = height / MAX_SIZE;
      newHeight = MAX_SIZE;
      newWidth = Math.ceil(width / ratio);
    } else {
      newWidth = MAX_SIZE;
      newHeight = MAX_SIZE;
    }
    
    return { width: newWidth, height: newHeight };
  }

  private async getDataUrlFromBlob(blob: Blob) {
    return await new Promise<string>((resolve) => {
      const fileReader = new FileReader();

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.readAsDataURL(blob);
    }); 
  }
}
