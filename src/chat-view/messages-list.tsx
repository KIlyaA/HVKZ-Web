import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import ChatView from 'react-chatview';
import styled from 'styled-components';

import { inject } from '../utils/di';
import { CommonStore } from '../domain/common-store';
import { UsersStore } from '../domain/users-store';
import { Chat, Message } from '../domain/chat';
import { UnknownUser } from '../domain/user';
import { MessageItem } from './message-item';
import background from './background.png';

interface MessagesListProps {
  chat: Chat;
  className?: string;
}

@observer
class MessagesList extends React.Component<MessagesListProps> {

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  @computed
  private get messages(): Message[] {
    return this.props.chat.messages.slice();
  }

  public render(): JSX.Element | null {
    if (this.messages.length === 0) {
      return (
        <div className={this.props.className}>
          История сообщений пуста
        </div>
      );
    }

    return (
      <ChatView
        flipped={true}
        reversed={true}
        scrollLoadThreshold={100}
        onInfiniteLoad={this.loadHistory}
        shouldTriggerLoad={this.shouldLoadHistory}
        className={this.props.className}
      >
        {this.messages.map(this.renderMessage)}
      </ChatView>
    );
  }

  private renderMessage = (message: Message, index: number, messages: Message[]): JSX.Element => {
    const user = this.usersStore.users.get(message.senderId) || UnknownUser;
    const isOut = this.commonStore.currentUserId === message.senderId;
    const prevMessage = messages[index - 1] || null;

    const isStartChain = prevMessage !== null && prevMessage.senderId !== message.senderId;
    return (
      <div 
        key={message.timestamp}
        className={'box ' + (isStartChain ? ' start' : '')}
      >
        <MessageItem
          message={message}
          isOut={isOut}
          user={user}
          showAvatar={isStartChain}
        />
      </div>
    );
  }

  private shouldLoadHistory = () => {
    const chat = this.props.chat;
    return !chat.isFetching || chat.canLoadHistory;
  }

  private loadHistory = async () => {
    const chat = this.props.chat;

    if (!chat.isFetching || chat.canLoadHistory) {
      await chat.loadHistory();
    }
  }
}

const StyledMessagesList = styled(MessagesList)`
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  flex: 1;
  background: #f5f5f5 url(${background}) repeat;
  padding: 12px 15px;

  .box {
    margin-bottom: 12px;
    .start {
      margin-bottom: 8px;
    }
  }
`;

export { StyledMessagesList as MessagesList };
