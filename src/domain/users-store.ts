import * as Firebase from 'firebase';
import { action, observable } from 'mobx';

import { inject, singleton } from '../utils/di';
import { User } from './models';

export const unknownUser: User = {
  uid: 0,
  name: 'Неизвестный',
  user: 'unknown',
  phone: '+00000000000',
  email: 'unknown@who.is',
  photo: 'https://api.adorable.io/avatars/285/random@adorable.io.png',

  regdate: '',
  programStartDate: '',
  promo: false,
  group: {
    id: 999,
    name: 'unknowns'
  },

  city: '',
  country: '',

  age: 0,
  birthday: '',
  gender: 'Неизсвеcтно',

  signature: '',

  parameters: {
    chest: '',
    underchest: '',
    weight: '',
    growth: '',
    desiredWeight: '',
    waistCirc: '',
    girthPelvis: '',
    girthButtocks: '',
    hipCirc: ''
  }
};

@singleton(UsersStore)
export class UsersStore {

  @observable.shallow
  public users: Map<number, User | null> = new Map();

  @inject(Firebase.database)
  private database: Firebase.database.Database;

  public async addUser(userId: number) {
    if (this.users.get(userId) != null) {
      return;
    }

    this.setUser(userId, unknownUser);

    const snapshot: Firebase.database.DataSnapshot =
      await this.database.ref(`users/${userId}`).once('value');
    
    if (!snapshot.exists()) {
      this.setUser(userId, null);
      return;
    }

    const user: User = JSON.parse(snapshot.val().data);
    this.setUser(userId, user);
  }

  @action
  public setUser(userId: number, user: User | null) {
    this.users.set(userId, user);
  }

  @action
  public async loadAll() {
    const snapshot: Firebase.database.DataSnapshot =
      await this.database.ref('users').once('value');

    snapshot.forEach(action((userSnapshot:  Firebase.database.DataSnapshot)  => {
      let user = JSON.parse(userSnapshot.val().data);

      if (user.uid) {
        this.users.set(user.uid, user);      
      }

      return false;
    }));
  }
}
