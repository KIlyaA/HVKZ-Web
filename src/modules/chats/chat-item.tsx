import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';

import { inject } from '../../utils/di';
import { SessionStore } from '../../domain/session-store';
import { UsersStore } from '../../domain/users-store';
import { CommonStore } from '../../domain/common-store';

import { Chat } from '../../domain/chat';
import { User, Message } from '../../domain/models';
import { TypingIndicator } from '../../typing-indicator';

interface ChatItemProps {
  chat: Chat;
  className?: string;
}

@observer
class ChatItemStructure extends React.Component<ChatItemProps> {

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  @computed
  private get user(): User | undefined {
    const { type, lastMessage, id } = this.props.chat;

    if (type === 'chat') {
      return this.usersStore.users.get(Number(id)) || void 0;
    }

    return lastMessage != null ?
      this.usersStore.users.get(lastMessage.senderId) || void 0 : void 0;
  }

  public render(): JSX.Element | null {
    const { chat: { type, lastMessage }, className } = this.props;

    if (type === 'groupchat' && !lastMessage) {
      return null;
    }
    
    return (
      <div className={className}>
        <img
          className="avatar"
          src={!!this.user ? this.user.photo : 
            'https://api.adorable.io/avatars/285/random@adorable.io.png'}
          alt={!!this.user ? this.user.name : 'Неизвестный пользователь'}
        />
        <div className="center">
          <div className="name">
            {!!this.user ? this.getSenderName(this.user.name) : 'Неизвестный пользователь'}
          </div>
          <p className="content">{this.getMessageText(lastMessage)}</p>
        </div>
        {!!lastMessage && (
          <div className="right">  
            <div className="time">
              {this.getTimeMessage(lastMessage.timestamp)}
            </div>
            {this.props.chat.isComposing && <TypingIndicator/>}
          </div>
        )}
      </div>
    );
  }

  private getMessageText(message: Message | null): string {
    if (message === null) {
      const chat = this.props.chat;
      if (Number(chat.id) === this.commonStore.supportId) {
        return 'Вы можете задать свой вопрос мне';
      }

      return 'История сообщений пуста';
    }

    const user = message.senderId === this.sessionStore.currentUserId ? 'Вы: ' : '';
    return user + (message.body || '<Вложения>');
  }
  
  private getTimeMessage(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  }

  private getSenderName(name: string): string {
    const segments = name.split(/\s+/g);

    if (!segments[1] || !segments[2]) {
      return segments[0] || 'Неизвестный';
    }

    return (segments[1] || '') + ' ' + (segments[2] || '');
  }
}

export const ChatItem = styled(ChatItemStructure)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  padding: 16px 15px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #f2f2f2;

  &:last-child {
    border-bottom: none;
  }

  > .avatar {
    display: block;
    width: 40px;
    height: 40px;
    margin-right: 15px;
    border-radius: 50%;
  }

  > .center {
    flex: 1;
    overflow: hidden;

    > .name {
      font-size: 14px;
      font-weight: bold;
      margin-right: 10px;
      color: #555;
    }
  }

  > .right {
    > .time {
      font-size: 12.5px;
      color: #555;
    }

    > ${TypingIndicator} {
      width: auto;
      margin: 0 auto;
    }
  }

  .content {
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    color: #333;
  }
`;
