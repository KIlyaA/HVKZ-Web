import { inject } from '../utils/di';
import { HistoryManager } from '../utils/history-manager';
import { action, computed, observable, runInAction } from 'mobx';
import { $msg, Strophe } from 'strophe.js';

import { Connection } from './connection';

export interface Message {
  body: string;
  images: string[];
  forwarded: FWD[];
  senderId: number;
  recipientId: number;
  timestamp: number;
}

export interface FWD {
  images: string[];
  message: string;
  sender: number;
  timestamp: number;
}

export class Chat {

  public readonly jid: string;
  public readonly type: string;

  @observable
  public isFetching: boolean = false;

  @observable
  public canLoadHistory: boolean = true;

  @observable 
  public canSendStatus: boolean = true;
  
  @observable 
  public isToggled: boolean = false;

  @observable.shallow
  public messages: Array<Message> = [];

  @observable 
  public unreads: Array<number> = [];

  @observable
  public writers: Array<number> = [];

  @observable 
  public isNewMessages: boolean = false;

  private connection: Connection;

  private lastTimestamp: number = 0;

  @inject(HistoryManager)
  private historyManager: HistoryManager;

  @computed 
  public get lastMessage(): Message | null {
    return this.messages[this.messages.length - 1] || null;
  }

  constructor(connection: Connection, jid: string, type: 'chat' | 'groupchat') {
    this.connection = connection;
    this.type = type;
    this.jid = jid;

    connection.addListener({
      handler: this.onStanzaReceive,
      from: jid,
      name: 'message'
    });

    this.loadHistory();
  }

  public async loadHistory() {
    if (this.isFetching) {
      return;
    }
    
    const firstMessage = this.messages.length === 0 ? null : this.messages[0];
    const lastTimestamp = !!firstMessage
      ? firstMessage.timestamp
      : Math.floor(Date.now() / 1000);

    try {
      this.isFetching = true;
      const history = await this.historyManager.getHistory(this.jid, lastTimestamp);
  
      if (history === null) {
        this.canLoadHistory = false;
        return;
      }

      runInAction(() => {
        this.messages = history.concat(this.messages.slice());
        this.isFetching = false;
      });
    } catch (e) {
      console.log(e);
      runInAction(() => {
        this.isFetching = false;
      });
    }
  }

  @action 
  public composing(): void {
    if (!this.canSendStatus) {
      return;
    }

    if (this.connection.isConnected) {
      const status = $msg({ to: this.jid, type: this.type })
      .c('composing', { xmlns: 'http://jabber.org/protocol/chatstates' });

      this.connection.send(status);
      this.canSendStatus = false;

      setTimeout(action(() => this.canSendStatus = true), 6000);
    }
  }

  @action
  public enter(): void {
    this.isToggled = true;
    this.isNewMessages = false;

    if (this.connection.isConnected) {
      const status = $msg({ to: this.jid, type: this.type })
      .c('active', { xmlns: 'http://jabber.org/protocol/chatstates' });

      this.connection.send(status);
    }
  }

  @action 
  public leave(): void {
    this.isToggled = false;

    if (this.connection.isConnected) {
      const status = $msg({ to: this.jid, type: this.type })
      .c('inactive', { xmlns: 'http://jabber.org/protocol/chatstates' });

      this.connection.send(status);
    }
  }

  @action
  // tslint:disable-next-line:no-any
  public sendMessage(text: string, images: string[] = [], forwarded: FWD[] = []): void {
    if (this.connection.isConnected) {
      const id = Strophe.getNodeFromJid(this.jid);
      const recipientId = Number(id) || 0;
      const timestamp = Math.floor(Date.now() / 1000);
      const senderId = Number(this.connection.userId);
  
      const message: Message = { 
        body: text,
        images,
        forwarded,
        senderId,
        recipientId,
        timestamp
      };
  
      const packet = $msg({ to: this.jid, type: this.type })
        .c('body').t(JSON.stringify(message));
  
      this.connection.send(packet);
      this.lastTimestamp = timestamp;
  
      this.messages.push(message);
      this.unreads.push(message.timestamp);
      this.historyManager.addMessage(this.jid, message);
    }
  }

  @action 
  private onStatusChanged(status: string, senderId: number): void {
    console.log(this.jid, status);
    switch (name) {
      case 'inactive': {
        this.removeFromWriters(senderId);
        break;
      }

      case 'active': {
        this.unreads = [];
        break;
      }

      case 'composing': {
        this.unreads = [];
        this.writers.push(senderId);

        setTimeout(action(() => this.removeFromWriters(senderId)), 6000);
        break;
      }

      default: break;
    }

    console.log(status, senderId);
  }

  // tslint:disable-next-line:no-any
  @action 
  private async onMessageReceive(message: Message) {
    if (message.timestamp === this.lastTimestamp && this.type === 'groupchat') {
      return;
    }
        
    if (await this.historyManager.addMessage(this.jid, message)) {
      this.unreads = [];
      this.messages.push(message);
    }
  }

  private removeFromWriters(senderId: number) {
    const index = this.writers.indexOf(senderId);
    // tslint:disable-next-line:no-bitwise
    if (~index) {
      this.writers.splice(index, 1);
    }
  }

  private onStanzaReceive = (stanza: Element): boolean => {
    try {
      const child = stanza.children[0];
      const childName = child.tagName.toLowerCase();

      switch (childName) {
        case 'body': {
          const message: Message = JSON.parse(child.innerHTML);
          this.onMessageReceive(message);
          this.isNewMessages = this.isToggled;
          break;
        }

        case 'active':
        case 'inactive':
        case 'composing': {
          const from = stanza.getAttribute('from')!;
          const senderId = Number.parseInt(
            from.replace(this.jid + '/', '') || Strophe.getNodeFromJid(from));
          const name = childName;

          if (senderId === Number(this.connection.userId)) {
            break;
          }

          this.onStatusChanged(name, senderId);
          break;
        }

        default: break;
      }
    } catch (e) {
      console.log(e);
    }

    return true;
  }
}
