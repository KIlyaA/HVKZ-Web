import * as Firebase from 'firebase';
import { observable, reaction, runInAction } from 'mobx';

import { singleton, inject } from '../utils/di';
import { APIClient } from '../api';
import { ChatsStore } from './chats-store';
import { Connection } from './connection';
import { UsersStore } from './users-store';
import { GroupsStore } from './groups-store';
import { User } from './user';

@singleton(CommonStore)
export class CommonStore {

  @observable
  public currentUserId: number;

  @observable
  public supportId: number;

  @observable
  public isInit: boolean = false;

  @inject(Connection)
  private connection: Connection;

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  @inject(APIClient)
  private apiClient: APIClient;

  public async init(user: User): Promise<void> {
    this.currentUserId = user.uid;
    this.usersStore.setUser(user.uid, user);
    await this.databaseService.ref(`users/${user.uid}`).update({
      data: JSON.stringify(user)
    });

    const supportId = (await this.databaseService.ref('options/support').once('value')).val();
    await this.chatsStore.addPersonalChat(supportId);

    const userIds = await this.apiClient.getRoster(user.user);
    await Promise.all(userIds.map(userId => this.chatsStore.addPersonalChat(userId)));

    await this.groupsStore.init();
    await this.addGroupChats();

    try {
      await this.connection.connect(user.uid);
    } catch (ignored) { /* ignored */ }

    reaction(() => this.groupsStore.groups, () => this.addGroupChats());

    runInAction(() => {
      this.supportId = supportId;
      this.isInit = true;
    });
  }

  private addGroupChats = async () => {
    const groups: Promise<void>[] = [];

    for (let group of this.groupsStore.groups.values()) {
      if (group.admin === this.currentUserId || group.members.indexOf(this.currentUserId!) !== -1) {
        groups.push(this.chatsStore.addGroupChat(group.name));
      }
    }

    return Promise.all(groups);
  }
}
