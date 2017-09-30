import { Group } from './models';
import { UsersStore } from './users-store';
import { observable, action } from 'mobx';

import { inject, singleton } from '../utils/di';
import { HistoryManager } from '../utils/history-manager';
import { Chat } from './chat';

@singleton(ChatsStore)
export class ChatsStore {
  
  @observable.shallow
  public chats: Map<string, Chat> = new Map();

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(HistoryManager)
  private historyManager: HistoryManager;

  public addPersonalChat = async (userId: number) => {
    try {
      await this.createChat(userId.toString(), 'chat');
      await this.usersStore.addUser(userId);
    } catch { /* ignored */ }
  }

  public addGroupChat = async (group: Group) => {
    try {
      await this.createChat(group.name, 'groupchat');
      await this.usersStore.addUser(group.admin);
      Promise.all(group.members.map(member => this.usersStore.addUser(member)));
    } catch { /* ignored */ }
  }

  @action
  private async createChat(chatId: string, type: 'chat' | 'groupchat') {
    if (this.chats.has(chatId)) {
      throw new Error('Chat already exists');
    }

    const chat = new Chat(chatId, type);
    this.chats.set(chatId, chat);
    await this.historyManager.initChat(chatId);
    return chat;
  }
}
