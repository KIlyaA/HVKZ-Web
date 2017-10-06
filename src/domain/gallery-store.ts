import * as Firebase from 'firebase';
import { observable } from 'mobx';

import { inject, singleton } from '../utils/di';
import { Photo } from './models';

@singleton(GalleryStore)
export class GalleryStore {
  @observable public galleries: Map<number, Photo[] | null> = new Map();

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  @inject(Firebase.storage) private storageService: Firebase.storage.Storage;

  public async loadGallery(userId: number): Promise<void> {
    const reference = this.databaseService.ref('photos/' + userId);
    const snapshot: Firebase.database.DataSnapshot = await reference.once(
      'value'
    );

    if (!snapshot.exists()) {
      this.galleries.set(userId, null);
      return;
    }

    reference.on('value', s => {
      console.log(s);
      if (s != null) {
        const photos: Photo[] = [];

        s.forEach(p => {
          photos.push(p.val());
          return false;
        });

        this.galleries.set(userId, photos.sort((a, b) => b.date! - a.date!));
      }
    });
  }

  public async addToGallery(
    userId: number,
    url: string,
    description: string = ''
  ) {
    const date = Math.floor(Date.now() / 1000);
    const reference = this.databaseService.ref('photos/' + userId);
    await reference.child(date.toString()).update({ date, url, description });
  }

  public async removeFromGallery(userId: number, index: number) {
    try {
      const gallery = this.galleries.get(userId);

      if (gallery) {
        const photo = gallery[index];

        if (photo) {
          const url = document.createElement('a');
          url.href = decodeURIComponent(photo.url);
          const filename = url.pathname.split('/').pop();
          console.log(filename);

          if (filename) {
            await this.databaseService
              .ref('photos')
              .child(userId.toString())
              .child(photo.date!.toString())
              .remove();

            await this.storageService
              .ref('photos')
              .child(filename)
              .delete();
          }
        }
      }
    } catch (e) {
      console.log(e);
      /* ignored */
    }
  }
}
