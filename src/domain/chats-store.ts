import { UsersStore } from './users-store';
import { observable, action, autorun, when } from 'mobx';
import { Strophe, $pres } from 'strophe.js';

import { inject, singleton } from '../utils/di';
import { Chat } from './chat';
import { Connection } from './connection';
import { GroupsStore } from './groups-store';

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

  public constructor() {
    this.connection.addListener({ handler: this.onNewChat, name: 'message' });
    this.connection.addListener({ handler: this.onNewChat, name: 'presence' }); 
  }

  public async init(userId: number) {
    const chatIds = await this.getRoster(userId);
    chatIds.forEach(id => {
      this.addPersonalChat(id.toString());
    });

    autorun(() => {
      this.groupsStore.groups.forEach((group, name) => {
        if (group.admin === userId || group.members.indexOf(userId) !== -1) {
          this.addGroupChat(name);        
        }
      }); 
    });
  }

  @action
  private addPersonalChat(userId: string): void {
    if (this.chats.has(userId)) {
      return;
    }

    this.usersStore.addUser(Number(userId));

    const jid = userId + '@s0565719c.fastvps-server.com';
    const chat = new Chat(this.connection, jid, 'chat');

    this.chats.set(userId, chat);
  }

  private addGroupChat(groupName: string): void {    
    if (this.chats.has(groupName)) {
      return;
    }

    const group = this.groupsStore.groups.get(groupName)!;

    this.usersStore.addUser(group.admin);
    group.members.forEach(member => {
      this.usersStore.addUser(member);
    });

    const jid = groupName + '@conference.s0565719c.fastvps-server.com';
    const chat = new Chat(this.connection, jid, 'groupchat');
    
    when(() => this.connection.isConnected, () => {
      const to = jid + '/' + this.connection.userId;
      const presence = $pres({ to })
        .c('x', { xmlns: Strophe.NS.MUC })
        .c('history', { maxstanzas: 100 });

      this.connection.send(presence);
    });

    this.chats.set(groupName, chat);
  }

  private async getRoster(userId: number): Promise<number[]> {
    const url = `http://api.hvkz.org:9090/plugins/restapi/v1/users/${userId}/roster`;
    const headers = {
      'Accept': 'application/json',
      'Authorization': 'xp2rmBRtww9B2N5h',
    };

    const response = await fetch(url, { method: 'GET', headers });
    const status = await response.status;
    const roster = (await response.json()).rosterItem || [];

    if (status === 200) {
      if (roster.push) {
        const ids: number[] = [];
        roster.forEach((record: { jid: string }) => {
          ids.push(Number(Strophe.getNodeFromJid(record.jid))); 
        });

        return ids;
      }

      return [Number(Strophe.getNodeFromJid(roster.jid))];
    }

    return [];
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
          this.addPersonalChat(id);
        }
      }
    } catch (e) {
      // 
    }

    return true;
  }
}
