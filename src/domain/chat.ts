import { action, computed, observable } from 'mobx';
import { $msg } from 'strophe.js';

import { Connection } from './connection';

export interface Message {
  body: string;
  images: string[];
  forwarded: Message[];
  senderId: number;
  recipientId: number;
  timestamp: number;
}

export class Chat {

  public readonly jid: string;
  public readonly type: string;

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

  private lastTimestamp: number;

  @computed get lastMessage() {
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

    window[jid] = (text: string) => this.sendMessage(text);
  }

  @action 
  public composing(): void {
    if (!this.canSendStatus) {
      console.log(false);
      return;
    }

    const status = $msg({ to: this.jid, type: this.type })
      .c('composing', { xmlns: 'http://jabber.org/protocol/chatstates' });

    this.connection.send(status);
    this.canSendStatus = false;

    setTimeout(action(() => this.canSendStatus = true), 6000);
  }

  @action
  public enter(): void {
    this.isToggled = true;
    this.isNewMessages = false;

    const status = $msg({ to: this.jid, type: this.type })
      .c('active', { xmlns: 'http://jabber.org/protocol/chatstates' });

    this.connection.send(status);
  }

  @action 
  public leave(): void {
    this.isToggled = false;

    const status = $msg({ to: this.jid, type: this.type })
      .c('inactive', { xmlns: 'http://jabber.org/protocol/chatstates' });

    this.connection.send(status);
  }

  @action
  // tslint:disable-next-line:no-any
  public sendMessage(text: string, images: string[] = [], forwarded: Message[] = []): void {
    const id = Strophe.getNodeFromJid(this.jid);
    const recipientId = Number(id);
    const timestamp = Math.floor(Date.now() / 1000);
    const senderId = this.connection.userId;

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

    this.messages.push(message);
    this.unreads.push(message.timestamp);
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
  private onMessageReceive(message: Message): void {
    console.log(this.jid, message);
    this.unreads = [];
    this.messages.push(message);
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
          
          if (this.lastTimestamp === Number(message.timestamp) && this.type === 'groupchat') {
            return true;
          }

          this.onMessageReceive(message);
          this.isNewMessages = this.isToggled;
          break;
        }

        case 'active':
        case 'inactive':
        case 'composing': {
          const from = stanza.getAttribute('from')!;
          const senderId = from.replace(this.jid + '/', '') || Strophe.getNodeFromJid(from);
          const name = childName;
          this.onStatusChanged(name, Number(senderId));
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
