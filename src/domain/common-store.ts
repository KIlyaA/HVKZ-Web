import * as Firebase from 'firebase';
import { observable, runInAction, action, computed } from 'mobx';

import { singleton, inject } from '../utils/di';
import { APIClient } from '../api';
import { ChatsStore } from './chats-store';
import { Connection } from './connection';
import { UsersStore } from './users-store';
import { GroupsStore } from './groups-store';
import { GalleryStore } from './gallery-store';
import { User } from './user';

export interface MenuItem {
  bzu: number[];
  dayArray: string[];
}

@singleton(CommonStore)
export class CommonStore {

  @observable
  public currentUserId: number;

  @observable
  public supportId: number;

  @observable
  public isInit: boolean = false;

  @observable.ref
  public menu: MenuItem[] = [];

  @inject(Connection)
  private connection: Connection;

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  @inject(GalleryStore)
  private galleryStore: GalleryStore;

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  @inject(APIClient)
  private apiClient: APIClient;

  @computed
  private get user(): User {
    return this.usersStore.users.get(this.currentUserId)!;
  }

  @action
  public async init(user: User): Promise<void> {
    this.currentUserId = user.uid;
    this.usersStore.users.set(user.uid, user);
    
    await this.initUserData();
    await this.initSettings();
    await this.initChats();

    console.log(this.connection.isConnected);

    // try {
    //   await this.connection.connect(user.uid);
    // } catch (ignored) { /* ignored */ }

    runInAction(() => {
      this.isInit = true;
    });
  }

  private initChats = async () => {
    if (this.supportId) {
      await this.chatsStore.addPersonalChat(this.supportId);      
    }

    const groupsChats = (await this.groupsStore.init(this.currentUserId))
      .map(g => this.chatsStore.addGroupChat(g.name));

    const personalChats = (await this.apiClient.getRoster(this.currentUserId.toString()))
      .map(userId => this.chatsStore.addPersonalChat(userId));

    await Promise.all(personalChats.concat(groupsChats));
  }

  private initUserData = async () => {
    await this.databaseService.ref(`users/${this.user.uid}`).update({
      data: JSON.stringify(this.user)
    });

    this.galleryStore.loadGallery(this.user.uid);
    this.databaseService.ref('/menu').on('value', this.initMenu);
  }

  private initSettings = async () => {
    const supportId = (await this.databaseService.ref('options/support').once('value')).val();

    runInAction(() => {
      this.supportId = supportId;
    });
  }

  @action
  private initMenu = async (snapshot: Firebase.database.DataSnapshot) => {
    if (snapshot !== null) {

      const data: MenuItem[] = [];

      snapshot.forEach(menuItemSnapshot => {
        data.push(menuItemSnapshot.val());
        return false;
      });

      const user = this.usersStore.users.get(this.currentUserId)!;
      
      const difference = Math.floor(Date.now() / 1000) - Number(user.regdate);
      const regday  = Math.floor((difference / (24 * 60 * 60)));

      let today = regday % data.length;
      let dayCount = 7;

      if (today === 0) {
        today = data.length;
      }

      const weekly: MenuItem[] = [];

      for (let i = today; i < today + dayCount; i++) {
        if (i >= data.length) {
            dayCount = (today + dayCount) - data.length;
            today = 0;
            i = 0;
        }

        weekly.push(data[i]);
      }
    
      this.menu = weekly;
    }
  }
}
