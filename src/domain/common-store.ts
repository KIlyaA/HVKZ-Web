import * as Firebase from 'firebase';
import { observable, runInAction, action, computed } from 'mobx';

import { singleton, inject } from '../utils/di';
import { APIClient } from '../api';
import { XMPP } from './xmpp';
import { ChatsStore } from './chats-store';
import { UsersStore } from './users-store';
import { GroupsStore } from './groups-store';
import { GalleryStore } from './gallery-store';
import { MenuItem, User } from './models';

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

  @inject(XMPP)
  private xmpp: XMPP;

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
    
    console.log('USER_DATA');
    await this.initUserData();

    console.log('SETTINGS');
    await this.initSettings();

    console.log('CHATS');
    await this.initChats();

    console.log(this.xmpp.error);
    
    // try {
    //   await this.xmpp.connect(user.uid);
    // } catch { /* ignored */ }

    runInAction(() => {
      this.isInit = true;
    });
  }

  private initChats = async () => {
    if (this.supportId) {
      await this.chatsStore.addPersonalChat(this.supportId);      
    }

    const groupsChats = (await this.groupsStore.init(this.currentUserId))
      .map(this.chatsStore.addGroupChat);

    const personalChats = (await this.apiClient.getRoster(this.currentUserId.toString()))
      .map(this.chatsStore.addPersonalChat);

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
