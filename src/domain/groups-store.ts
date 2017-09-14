import * as Firebase from 'firebase';
import { observable, action, runInAction } from 'mobx';

import { inject, singleton } from '../utils/di';

export interface Group {
  name: string;
  admin: number;
  members: number[];
  notice: string;
}

@singleton(GroupsStore)
export class GroupsStore {

  @observable.shallow
  public groups: Map<string, Group> = new Map();

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  public async init(): Promise<void> {
    const groupsReference = this.databaseService.ref('groups');
    const snapshot: Firebase.database.DataSnapshot = await groupsReference.once('value');

    runInAction(() => {
      snapshot.forEach(entry => {
        this.addGroup(entry);
        return false;
      });
    });

    groupsReference.on('child_added', action(this.addGroup));
    groupsReference.on('child_changed', action(this.addGroup));
  }

  private addGroup = (snapshot: Firebase.database.DataSnapshot) => {
    const name = snapshot.key!;

    const info = snapshot.val();
    const group: Group = { name, ...info };

    this.groups.set(name, group);
  }
}
