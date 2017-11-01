import { UIStore } from './ui-store';
import * as Firebase from 'firebase';
import { observable, runInAction, action, computed, reaction } from 'mobx';

import { singleton, inject } from '../utils/di';
import { APIClient } from '../api';
import { XMPP } from './xmpp/index';
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
  public isInit: boolean = false;

  @observable.ref
  public menu: MenuItem[] = [];

  public supportId: number;
  
  public admins: number[] = [];

  private acceptedDuration: { [id: string]: number } = {};

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

  @inject(UIStore)
  private uiStore: UIStore;

  @inject(Firebase.database)
  private databaseService: Firebase.database.Database;

  @inject(APIClient)
  private apiClient: APIClient;

  @computed
  public get isActiveUser(): boolean {
    const duration = this.acceptedDuration[this.user.group.id.toString()];

    if (duration !== null) {
      if (duration === 0) {
        return true;
      }

      let startProgramTimestamp = -1;

      if (this.user.programStartDate.length !== 0) {
        const splittedDate = this.user.programStartDate.split('.');
        const date = new Date();
        date.setDate(Number(splittedDate[0]));
        date.setMonth(Number(splittedDate[1]));
        date.setFullYear(Number(splittedDate[2]));
        
        startProgramTimestamp = date.getTime();
      }

      if (startProgramTimestamp < 0) {
        return false;
      }

      const difference = Date.now() - startProgramTimestamp;
      const daysFromActivated  = Math.floor((difference / (24 * 60 * 60)));

      return daysFromActivated <= duration;
    } else {
      return false;
    }
  }

  @computed
  public get isAdmin(): boolean {
    return this.admins.indexOf(this.currentUserId) !== -1;
  }

  @computed
  private get user(): User {
    return this.usersStore.users.get(this.currentUserId)!;
  }

  @action
  public async init(user: User): Promise<void> {
    this.currentUserId = user.uid;
    this.usersStore.users.set(user.uid, user);

    console.log('USER_DATA');
    this.initUserData();

    console.log('SETTINGS');
    await this.initSettings();

    console.log('CHATS');
    await this.initChats();

    this.xmpp.connect(user.uid);

    runInAction(() => {
      this.isInit = true;
    });

    reaction(() => this.groupsStore.groups, this.watchGroupsChanges);
  }

  @action
  public updateCurrentUser(user: User) {
    this.usersStore.users.set(user.uid, user);
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

    await Promise.all(groupsChats);
  }

  private initUserData = async () => {
    this.databaseService.ref(`users/${this.user.uid}`).update({
      data: JSON.stringify(this.user)
    });

    this.galleryStore.loadGallery(this.user.uid);
    this.databaseService.ref('/menu').on('value', this.initMenu);
  }

  private initSettings = async () => {
    const settings = (await this.databaseService.ref('options').once('value')).val();
    const { support, acceptedDuration, moderators } = settings;
    
    runInAction(() => {
      this.supportId = support;
      this.acceptedDuration = acceptedDuration;
      this.admins = moderators;
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

  @action
  private watchGroupsChanges = async () => {
    const groupsChats: { [name: string]: boolean } = {};

    this.chatsStore.chats.forEach((chat, name) => {
      if (chat.type === 'groupchat') {
        groupsChats[name] = false;
      }
    });

    this.groupsStore.groups.forEach(group => {
      groupsChats[group.name] = true;
    });

    for (let chatName in groupsChats) {
      if (groupsChats.hasOwnProperty(chatName)) {
        if (groupsChats[chatName]) {
          const group = this.groupsStore.groups.get(chatName)!;
          await this.chatsStore.addGroupChat(group);
        } else {
          this.chatsStore.removeChat(chatName);
        }
      }
    }

    this.uiStore.currentSlide = 0;
  }
}
