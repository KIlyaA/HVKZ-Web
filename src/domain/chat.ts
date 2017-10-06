import { XMPPReceiver } from './xmpp/receiver';
import { action, computed, observable, runInAction } from 'mobx';

import { inject } from '../utils/di';
import { XMPP } from './xmpp/index';
import { HistoryManager } from '../utils/history-manager';
import { Message, FWD } from './models';

export class Chat {

  public readonly id: string;
  public readonly type: 'chat' | 'groupchat';

  @observable
  public isFetching: boolean = false;

  @observable
  public canLoadHistory: boolean = true;

  @observable 
  public canSendStatus: boolean = true;
  
  @observable 
  public isToggled: boolean = false;

  @observable.shallow
  public messages: Message[] = [];

  @observable 
  public unreads: Array<number> = [];

  @observable
  public isComposing: boolean = false;

  @observable 
  public isNewMessages: boolean = false;

  private lastTimestamp: number = 0;

  @inject(XMPP)
  private xmpp: XMPP;

  @inject(XMPPReceiver)
  private receiver: XMPPReceiver;

  @inject(HistoryManager)
  private historyManager: HistoryManager;

  private timeoutId: number;

  @computed 
  public get lastMessage(): Message | null {
    return this.messages[this.messages.length - 1] || null;
  }

  constructor(id: string, type: 'chat' | 'groupchat') {
    this.id = id;    
    this.type = type;

    if (type === 'groupchat') {
      this.xmpp.joinToRoom(id);
    }

    this.receiver.registerChat(this);
    this.loadHistory();
  }

  public destroy() {
    this.receiver.unregisterChat(this);

    if (this.type === 'groupchat') {
      this.xmpp.leaveRoom(this.id);
    }
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
      const history = await this.historyManager.getHistory(this.id, lastTimestamp);
  
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

    try {
      this.xmpp.sendStatus(this.id, this.type, 'composing');
      this.canSendStatus = false;
      
      setTimeout(action(() => this.canSendStatus = true), 6000);
    } catch { /* ignored */ }
  }

  @action
  public enter(): void {
    this.isToggled = true;
    this.isNewMessages = false;

    try {
      this.xmpp.sendStatus(this.id, this.type, 'active');
    } catch { /* ignored */ }
  }

  @action 
  public leave(): void {
    this.isToggled = false;

    try {
      this.xmpp.sendStatus(this.id, this.type, 'inactive');
    } catch { /* ignored */ }
  }

  @action
  // tslint:disable-next-line:no-any
  public sendMessage(text: string, images: string[] = [], forwarded: FWD[] = []): void {
    const recipientId = Number(this.id) || 0;
    const timestamp = Math.floor(Date.now() / 1000);
    const senderId = Number(this.xmpp.userId);

    const message: Message = { 
      body: text,
      images,
      forwarded,
      senderId,
      recipientId,
      timestamp
    };

    const content = JSON.stringify(message);
    this.xmpp.sendMessage(this.id, this.type, content);
    this.lastTimestamp = timestamp;

    this.messages.push(message);
    this.unreads.push(message.timestamp);
    this.historyManager.addMessage(this.id, message);
  }

  @action 
  public onStatusChanged(status: string, senderId: number): void {
    if (senderId === this.xmpp.userId) {
      return;
    }
    
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
        this.isComposing = true;
        clearInterval(this.timeoutId);

        this.timeoutId = setTimeout(this.removeFromWriters, 6000);
        break;
      }

      default: break;
    }

    console.log(status, senderId);
  }

  @action 
  // tslint:disable-next-line:no-any
  public async onMessageReceive(content: any) {
    try {
      const message: Message = JSON.parse(content);
      
      if (message.timestamp === this.lastTimestamp && this.type === 'groupchat') {
        return;
      }
          
      if (await this.historyManager.addMessage(this.id, message)) {
        this.unreads = [];
        this.messages.push(message);
      }
  
      this.isNewMessages = this.isToggled;
    } catch {/* ignored */}
  }

  @action
  private removeFromWriters(senderId: number) {
    this.isComposing = false;
  }
}
