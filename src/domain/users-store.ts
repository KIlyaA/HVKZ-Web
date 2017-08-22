import * as Firebase from 'firebase';
import { action, observable } from 'mobx';

import { inject, singleton } from '../utils/di';
import { Connection } from './connection';
import { User } from './user';

@singleton(UsersStore)
export class UsersStore {

  @observable.shallow
  public users: Map<number, User | null> = new Map();

  @inject(Connection)
  private connection: Connection;

  @inject(Firebase.database)
  private database: Firebase.database.Database;

  public constructor() {
    this.connection.addListener({ name: 'presence', handler: this.onlineListen });
  }

  public async addUser(userId: number) {
    if (this.users.get(userId) != null) {
      return;
    }
    
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

  private onlineListen = (stanza: Element) => {
    const from = Strophe.getNodeFromJid(stanza.getAttribute('from')!);
    console.log(from, stanza);
    return true;
  }
}
