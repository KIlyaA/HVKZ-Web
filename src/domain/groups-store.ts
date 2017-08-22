import * as Firebase from 'firebase';
import { observable, action } from 'mobx';

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

  public constructor() {
    this.databaseService.ref('groups').on('value', this.onGroupsChange);
  }

  @action
  private onGroupsChange = (snapshot: Firebase.database.DataSnapshot) => {
    snapshot.forEach((entry) => {
      const name = entry.key!;

      const info = entry.val();
      const group: Group = { name, ...info };

      this.groups.set(name, group);
      return false;
    });
  }
}
