import * as Firebase from 'firebase';
import { observable, runInAction } from 'mobx';

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

  private userId: number;

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  public async init(userId: number) {
    this.userId = userId;

    const groupsReference = this.databaseService.ref('groups');
    const snapshot: Firebase.database.DataSnapshot = await groupsReference.once('value');

    const groups: Group[] = [];

    runInAction(() => {
      snapshot.forEach(childSnapshot => {
        const group = this.getGroupFromSnapshot(childSnapshot);
  
        if (group.admin === userId || group.members.indexOf(userId) !== -1) {
          this.groups.set(group.name, group);
          groups.push(group);
        }
  
        return false;
      });
    });

    return groups;
  }

  private getGroupFromSnapshot = (snapshot: Firebase.database.DataSnapshot) => {
    const name = snapshot.key!;

    const info = snapshot.val();
    const group: Group = { name, ...info };

    return group;
  }
}
