import * as React from 'react';
import { Link } from 'react-router-dom';
import { computed } from 'mobx';
import { observer } from 'mobx-react';

import { inject } from '../../utils/di';
import { Chat } from '../../domain/chat';
import { ChatsStore } from '../../domain/chats-store';
import { CommonStore } from '../../domain/common-store';

import { ChatItem } from './chat-item';
import { Layout } from '../components/layout';
import { GroupList } from './groups-list';
import { ConnectionStatus } from '../../connection-status';

@observer
export class ChatsPage extends React.Component {

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  @computed
  private get chats(): Chat[] {
    const chats: Chat[] = [];

    this.chatsStore.chats.forEach(chat => {
      if (chat === null) {
        return;
      }
      
      const chatId = Number(chat.id);
      if (
        (chat.type === 'chat' && chat.messages.length !== 0)
        || chatId === this.commonStore.supportId) {
        chats.push(chat);
      }
    });

    chats.sort(this.compare);
    return chats;
  }

  public render(): JSX.Element {
    return (
      <Layout>
        <ConnectionStatus/>
        <GroupList/>
        {this.chats.map(chat => {
          return (
            <Link
              key={chat.id}
              to={'/im/' + chat.id} 
              style={{ textDecoration: 'none' }}
            >
              <ChatItem chat={chat}/>
            </Link>
          );
        })}
        {this.commonStore.isAdmin && ('float button')}
      </Layout>
    );
  }

  private compare = (chat1: Chat, chat2: Chat): number => {
    const a = chat1.lastMessage ? chat1.lastMessage.timestamp : 0;
    const b = chat1.lastMessage ? chat1.lastMessage.timestamp : 0;

    return b - a;
  }
}
