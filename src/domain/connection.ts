import hmacsha1 from 'hmacsha1';
import { action, observable } from 'mobx';
import { $iq, $pres, Strophe } from 'strophe.js';

import { singleton } from './../utils/di';

export interface PacketListener {
  handler: (packet: Element) => boolean;
  ns?: string;
  name?: 'message' | 'presence' | 'iq';
  type?: 'chat' | 'groupchat';
  from?: string;

  // tslint:disable-next-line:no-any
  ref?: any;
}

@singleton(Connection)
export class Connection {
  
  private static HANDER_OPTIONS = {
    matchBareFromJid: true,
    ignoreNamespaceFragment: true 
  };

  private static IQ_PING = $iq({ type: 'get' }).c('ping', { xmlns: 'urn:xmpp:ping' });

  @observable
  public userId: number;

  @observable
  public isConnecting: boolean = false;

  @observable
  public isConnected: boolean = false;

  @observable
  public error: string | null = null;

  private hasAccount = false;

  // tslint:disable-next-line:no-any
  private packetListeners: Array<PacketListener> = [];
  private connection = new Strophe.Connection('ws://api.hvkz.org/chat/');

  @action
  public async connect(userId: number) {
    this.userId = userId;
    this.isConnecting = true;
    this.error = null;

    const jid = userId + '@s0565719c.fastvps-server.com/web';
    const password = hmacsha1(userId.toString(), 'password');

    if (!this.hasAccount) {
      const url = 'http://api.hvkz.org:9090/plugins/restapi/v1/users';
      const body = JSON.stringify({ username: userId, password });
      const headers = {
        'Accept': 'application/json',
        'Authorization': 'xp2rmBRtww9B2N5h',
        'Content-Type': 'application/json'
      };

      const response = await fetch(url, { method: 'POST', headers, body });
      const status = await response.status;

      // created or conflict
      if (status === 201 || status === 409) {
        this.hasAccount = true;
      }
    }

    if (this.hasAccount) {
      this.establishConnection(jid, password);
    }
  }

  public addListener(packetListener: PacketListener) {
    let ref = null;

    if (this.isConnected) {
      ref = this.connection.addHandler(
        packetListener.handler,
        packetListener.ns!,
        packetListener.name!,
        packetListener.type,
        void 0, 
        packetListener.from, 
        Connection.HANDER_OPTIONS as any // tslint:disable-line:no-any
      );
    }

    this.packetListeners.push(packetListener);
    return this.packetListeners.length - 1;
  }

  public deleteListener(id: number) {
    const ref = this.packetListeners[id].ref;
    this.connection.deleteHandler(ref);
    this.packetListeners.splice(id, 1);
  }

  public send(stanza: Strophe.Builder | Element) {
    this.connection.send(stanza);
  }

  public async sendIQ(iq: Strophe.Builder | Element, timeout: number): Promise<Element> {
    return new Promise<Element>((resolve, reject) => {
      this.connection.sendIQ(iq, resolve, reject, timeout);
    });
  }

  private async establishConnection(jid: string, password: string) {
    this.connection.reset();

    this.packetListeners.forEach(listener => {
      const { handler, ns, name, type, from } = listener;
      listener.ref = this.connection.addHandler(
        handler,
        ns!,
        name!,
        type,
        void 0,
        from,
        Connection.HANDER_OPTIONS as any // tslint:disable-line:no-any
      );
    });

    this.connection.connect(jid, password, this.onConnectionListen);
  }

  @action
  private onConnectionListen = (status: Strophe.Status, condition: string) => {
    switch (status) {
      case Strophe.Status.CONNECTING: {
        this.isConnecting = true;
        break;
      }

      case Strophe.Status.AUTHFAIL:
      case Strophe.Status.CONNFAIL: {
        this.error = 'Не удалось установить соединение с сервером';
        this.isConnecting = false;

        break;
      }

      case Strophe.Status.CONNECTED: {
        this.isConnecting = false;
        this.isConnected = true;
        this.error = null;
        
        this.send($pres());        
        this.connection.addTimedHandler(30000, () => {
          this.send(Connection.IQ_PING);
          return true;
        });
        break;
      }

      case Strophe.Status.DISCONNECTED: {
        this.isConnected = false;

        break;
      }

      default: break;
    }
  }
}
