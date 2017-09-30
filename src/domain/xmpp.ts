import hmacsha1 from 'hmacsha1';
import { action, observable } from 'mobx';
import { $iq, $pres, $msg, Strophe } from 'strophe.js';

import { inject, singleton } from '../utils/di';
import { XMPPReceiver } from '../utils/xmpp-receiver';
import { APIClient } from '../api';
import { CHAT_STATE } from './models';

@singleton(XMPP)
export class XMPP {

  private static PING = $iq({ type: 'get' }).c('ping', { xmlns: 'urn:xmpp:ping' }).tree();
  private static DOMAIN = 's0565719c.fastvps-server.com';
  private static ROOM_NAMESPACE = 'conference';

  @observable
  public userId: number;

  @observable
  public isConnecting: boolean = false;

  @observable
  public isConnected: boolean = false;

  @observable
  public error: string | null = null;

  private hasAccount = false;
  private connection = new Strophe.Connection('ws://api.hvkz.org/chat/');

  private rooms: string[] = [];

  @inject(APIClient)
  private apiClient: APIClient;

  @inject(XMPPReceiver)
  private receiver: XMPPReceiver;

  @action
  public async connect(userId: number) {
    this.userId = userId;
    this.isConnecting = true;
    this.error = null;

    const jid = `${userId}@${XMPP.DOMAIN}/web`;
    const password = btoa(hmacsha1(userId.toString(), 'password')).substr(0, 20);

    if (!this.hasAccount) {
      this.hasAccount = await this.apiClient.createChatAccount(userId, password);
    }

    if (this.hasAccount) {
      return new Promise((resolve, reject) =>
        this.establishConnection(jid, password, resolve, reject));
    }

    return Promise.reject(void 0);
  }

  // tslint:disable-next-line:no-any
  public sendMessage(chatId: string, type: 'chat' | 'groupchat', content: any) {
    if (!this.isConnected) {
      throw new Error('Connection not establish');
    }

    const to = type === 'chat' ? `${chatId}@${XMPP.DOMAIN}` :
      `${chatId}@${XMPP.ROOM_NAMESPACE}.${XMPP.DOMAIN}`;

    const packet = $msg({ to, type }).c('body').t(content).tree();
    this.connection.send(packet);
  }

  public sendStatus(chatId: string, type: 'chat' | 'groupchat', status: CHAT_STATE) {
    if (!this.isConnected) {
      throw new Error('Connection not establish');
    }

    const to = type === 'chat' ? `${chatId}@${XMPP.DOMAIN}` :
      `${chatId}@${XMPP.ROOM_NAMESPACE}.${XMPP.DOMAIN}`;

    const packet = $msg({ to, type })
      .c(status, { xmlns: 'http://jabber.org/protocol/chatstates' }).tree();

    this.connection.send(packet);
  }

  public joinToRoom(roomName: string) {
    if (this.isConnected) {
      this.sendEnterPresence(roomName);
    } 

    this.rooms.push(roomName);
  }

  public leaveRoom(roomName: string) {
    if (this.isConnected) {
      const to = `${roomName}@${XMPP.ROOM_NAMESPACE}.${XMPP.DOMAIN}/${this.userId}`;
      const presence = $pres({ to, type: 'unavailable' });
      this.connection.send(presence);

      this.rooms = this.rooms.filter(name => name !== roomName);
    }
  }

  private sendEnterPresence = (roomName: string) => {
    const to = `${roomName}@${XMPP.ROOM_NAMESPACE}.${XMPP.DOMAIN}/${this.userId}`;
    const presence = $pres({ to })
      .c('x', { xmlns: Strophe.NS.MUC })
      .c('history', { maxstanzas: 100 });

    this.connection.send(presence);    
  }

  private establishConnection(
    jid: string, password: string, onSuccess: () => void, onFailure: (reason: string) => void) {
    this.connection.reset();
    
    this.connection.connect(jid, password, action((status: Strophe.Status) => {
      console.log(Object.keys(Strophe.Status)[status]);

      switch (status) {
        case Strophe.Status.CONNECTING: {
          this.isConnecting = true;
          break;
        }

        case Strophe.Status.AUTHFAIL:
        case Strophe.Status.CONNFAIL: {
          this.error = 'Не удалось установить соединение с сервером';
          this.isConnecting = false;

          onFailure('Не удалось установить соединение с сервером');
          break;
        }

        case Strophe.Status.CONNECTED: {
          this.isConnecting = false;
          this.isConnected = true;
          this.error = null;

          this.connection.send($pres().tree());
          this.connection.addTimedHandler(30000, () => {
            this.connection.send(XMPP.PING);
            return true;
          });

          this.rooms.forEach(this.sendEnterPresence);
          this.connection.addHandler(this.receiver.onMessageReceive, '', 'message');

          onSuccess();
          break;
        }

        case Strophe.Status.DISCONNECTED: {
          this.isConnected = false;
          break;
        }

        default: break;
      }
    }));
  }
}
