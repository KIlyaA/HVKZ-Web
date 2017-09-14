import * as Firebase from 'firebase';
import { observable, action } from 'mobx';

import { injectable } from '../utils/di';

@injectable(FileUploadTask)
export class FileUploadTask {

  public readonly file: File;

  @observable
  public progress: number;

  @observable
  public downloadUrl: string;
  
  @observable
  public isLoaded: boolean = false;

  @observable
  public isCanceled: boolean = false;

  @observable
  public isFailed: boolean = false;

  public get ref(): string {
    return this.reference.fullPath;
  }

  private reference: firebase.storage.Reference;

  private uploadTask: Firebase.storage.UploadTask;

  public constructor(file: File, uploadTask: Firebase.storage.UploadTask) {
    this.file = file;
    this.uploadTask = uploadTask;
    this.reference = uploadTask.snapshot.ref;

    uploadTask.on('state_changed', this.handleUploadStatusChange);
    uploadTask.then(this.uploadSuccess, this.uploadFailed);
  }

  @action
  public cancel() {
    if (this.isLoaded) {
      this.reference.delete();
      return;
    }
    
    this.isCanceled = true;
    this.uploadTask.cancel();
  }

  @action
  private handleUploadStatusChange = (snapshot: Firebase.storage.UploadTaskSnapshot) => {
    this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  }

  @action
  private uploadSuccess = (snapshot: Firebase.storage.UploadTaskSnapshot) => {
    console.log('upload');
    this.isLoaded = true;
    this.downloadUrl = snapshot.downloadURL!;
  }

  @action
  private uploadFailed = (error: Error & { code: string }) => {
    if (error.code !== 'storage/canceled') {
      this.isFailed = true;
    }
  }
}
