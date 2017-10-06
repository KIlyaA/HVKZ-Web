import * as Firebase from 'firebase';
import { observable, runInAction, action } from 'mobx';

import { inject, singleton } from '../utils/di';
import { APIClient } from '../api';
import { Group } from './models';

@singleton(GroupsStore)
export class GroupsStore {

  @observable.shallow
  public groups: Map<string, Group> = new Map();

  private userId: number;

  private newItems: boolean = false;

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  @inject(APIClient)
  private apiClient: APIClient;

  public constructor() {
    this.databaseService.ref('groups').on('value', this.watchChanges);
  }

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

  public async createGroup(notice: string, members: number[]) {
    try {
      const roomName = btoa(Date.now().toString()).replace(/=/g, '');
      this.apiClient.createChatRoom(roomName, notice);

      await this.databaseService.ref('groups').child(roomName).update({
        admin: this.userId,
        notice,
        members
      });
    } catch {
      throw new Error('Не удалось создать группу');
    }
  }

  @action
  private watchChanges = (snapshot: Firebase.database.DataSnapshot) => {
    if (!this.newItems) {
      return;
    }

    this.groups.clear();
    snapshot.forEach(childSnapshot => {
      const group = this.getGroupFromSnapshot(childSnapshot);

      if (group.admin === this.userId || group.members.indexOf(this.userId) !== -1) {
        this.groups.set(group.name, group);
      }

      return false;
    });

  }

  private getGroupFromSnapshot = (snapshot: Firebase.database.DataSnapshot) => {
    const name = snapshot.key!;

    const info = snapshot.val();
    const group: Group = { name, ...info };

    return group;
  }
}
