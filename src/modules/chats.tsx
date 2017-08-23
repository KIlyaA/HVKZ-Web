import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Strophe } from 'strophe.js';

import { Chat } from '../domain/chat';
import { ChatsStore } from '../domain/chats-store';
import { inject } from '../utils/di';
import { ChatItem } from './chat-item';
import { Layout } from './components/layout';
import { GroupList } from './groups-list';

@observer
export class ChatsPage extends React.Component {

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @computed
  private get chats(): Chat[] {
    const chats: Chat[] = [];

    this.chatsStore.chats.forEach(chat => {
      if (chat.type === 'chat') {
        chats.push(chat);
      }
    });

    chats.sort(this.compare);
    return chats;
  }

  public render(): JSX.Element {
    return (
      <Layout>
        <GroupList/>
        {this.chats.map(chat => {
          return (
            <Link key={chat.jid} to={`/im/${Strophe.getNodeFromJid(chat.jid)}`}>
              <ChatItem chat={chat}/>
            </Link>
          );
        })}
      </Layout>
    );
  }

  private compare = (chat1: Chat, chat2: Chat): number => {
    const a = chat1.lastMessage ? chat1.lastMessage.timestamp : 0;
    const b = chat1.lastMessage ? chat1.lastMessage.timestamp : 0;

    return b - a;
  }
}
