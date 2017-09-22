import * as Firebase from 'firebase';
import { observable } from 'mobx';

import { inject, singleton } from '../utils/di';

export interface Photo {
  date: number;
  description: string;
  url: string;
}

@singleton(GalleryStore)
export class GalleryStore {

  @observable
  public galleries: Map<number, Photo[] | null> = new Map();

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  public async loadGallery(userId: number): Promise<void> {
    const reference = this.databaseService.ref('photos/' + userId);
    const snapshot: Firebase.database.DataSnapshot = await reference.once('value');

    if (!snapshot.exists()) {
      this.galleries.set(userId, null);
      return;
    }

    const photos: Photo[] = [];

    snapshot.forEach(p => {
      photos.push(p.val());
      return false;
    });

    this.galleries.set(userId, photos.sort((a, b) => b.date - a.date));
  }
}
