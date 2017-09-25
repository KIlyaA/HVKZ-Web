import { action, observable, when } from 'mobx';
import { $pres, Strophe } from 'strophe.js';

import { inject, singleton } from '../utils/di';
import { HistoryManager } from '../utils/history-manager';
import { Chat } from './chat';
import { Connection } from './connection';
import { GroupsStore } from './groups-store';
import { UsersStore } from './users-store';

@singleton(ChatsStore)
export class ChatsStore {

  @observable.shallow
  public chats: Map<string, Chat> = new Map();
  
  @inject(Connection)
  private connection: Connection;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  @inject(HistoryManager)
  private historyManager: HistoryManager;

  public constructor() {
    this.connection.addListener({ handler: this.onNewChat, name: 'message' });
    this.connection.addListener({ handler: this.onNewChat, name: 'presence' }); 
  }

  public async addPersonalChat(userId: number) {
    if (this.chats.has(userId.toString())) {
      return;
    }

    const jid = userId + '@s0565719c.fastvps-server.com';

    await this.usersStore.addUser(Number(userId));
    await this.historyManager.initChat(jid);

    const chat = new Chat(this.connection, jid, 'chat');

    this.setChat(userId.toString(), chat);
  }

  public async addGroupChat(groupName: string) {
    if (this.chats.has(groupName)) {
      return;
    }

    const group = this.groupsStore.groups.get(groupName)!;

    await this.usersStore.addUser(group.admin);
    group.members.forEach(member => {
      this.usersStore.addUser(member);
    });

    const jid = groupName + '@conference.s0565719c.fastvps-server.com';
    await this.historyManager.initChat(jid);

    const chat = new Chat(this.connection, jid, 'groupchat');
    this.setChat(groupName, chat);
    
    when(() => this.connection.isConnected, () => {
      const to = jid + '/' + this.connection.userId;
      const presence = $pres({ to })
        .c('x', { xmlns: Strophe.NS.MUC })
        .c('history', { maxstanzas: 100 });

      this.connection.send(presence);
    });
  }

  public reInitChats(): void {
    when(() => this.connection.isConnected, () => {
      console.log('reinit');
      this.chats.forEach(chat => {
        if (chat.type === 'groupchat') {
          const to = chat.jid + '/' + this.connection.userId;
          const presence = $pres({ to })
            .c('x', { xmlns: Strophe.NS.MUC })
            .c('history', { maxstanzas: 100 });

          this.connection.send(presence);
        }
      });
    });
  }

  @action
  private setChat(chatName: string, chat: Chat) {
    this.chats.set(chatName, chat);
  }

  private onNewChat = (stanza: Element) => {
    try {
      const from = stanza.getAttribute('from');
      const type = stanza.getAttribute('type');
      const id = Strophe.getNodeFromJid(from!);

      if (!this.chats.has(id)) {
        if (type === 'chat') {
          this.addGroupChat(id);
        } else if (type === 'groupchat') {
          this.addPersonalChat(Number(id));
        }
      }
    } catch (e) {
      // 
    }

    return true;
  }
}
