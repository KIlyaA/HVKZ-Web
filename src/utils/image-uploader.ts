import { FileUploadTask } from '../domain/file-upload-task';
import * as Firebase from 'firebase';

import { inject, singleton } from './di';
import { SessionStore } from '../domain/session-store';

@singleton(ImageUploader)
export class ImageUploader {

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @inject(Firebase.storage)
  private storageService: Firebase.storage.Storage;

  public upload(image: File) {
    const rootRef = this.storageService.ref();
    const timestamp = Math.floor(Date.now() / 1000);
    const imageName = this.sessionStore.currentUserId + '_' + timestamp;
    const imageRef = rootRef.child('photos/' + imageName);

    const uploadTask = imageRef.put(image);
    return new FileUploadTask(image, uploadTask);
  }

  public delete(paths: string[]) {
    console.log(paths);
  }
}
