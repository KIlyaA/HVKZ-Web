import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Strophe } from 'strophe.js';
import styled from 'styled-components';

import { Chat, Message } from '../domain/chat';
import { SessionStore } from '../domain/session-store';
import { User } from '../domain/user';
import { UsersStore } from '../domain/users-store';
import { inject } from '../utils/di';

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

  @computed
  private get user(): User | undefined {
    const { type, lastMessage, jid } = this.props.chat;

    if (type === 'chat') {
      return this.usersStore.users.get(Number(Strophe.getNodeFromJid(jid))) || void 0;
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
        <div className="right">
          <div className="info">
            <div className="name">
              {!!this.user ? this.getSenderName(this.user.name) : 'Неизвестный пользователь'}
            </div>
            <div className="time">{this.getTimeMessage(lastMessage.timestamp)}</div>
          </div>
          <p className="content">{this.getMessageText(lastMessage)}</p>
        </div>
      </div>
    );
  }

  private getMessageText(message: Message | null): string {
    if (message === null) {
      return 'История сообщений пуста';
    }

    let user: string;
    if (this.user != null) {
      user = this.user!.uid === this.sessionStore.currentUserId ? 'Вы: ' : '';
    } else {
      user = '';
    }
    
    return user + (message.body || '<Вложения>');
  }
  
  private getTimeMessage(timestamp: number): string {
    const date = new Date(timestamp);
    return date.getHours() + ':' + date.getMinutes();
  }

  private getSenderName(name: string): string {
    const segments = name.split(/\s+/g);
    return ((segments[1] || '') + ' ' + (segments[2] || '')) || segments[0] || 'Неизвестный';
  }
}

export const ChatItem = styled(ChatItemStructure)`
  display: flex;
  flex-flow: row nowrap;
  padding: 16px 15px;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #f2f2f2;

  &:last-child {
    border-bottom: none;
  }

  & > .avatar {
    display: block;
    width: 40px;
    height: 40px;
    margin-right: 10px;
    border-radius: 50%;
  }

  & > .right {
    flex: 1;
  }

  & .info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;

    & > .name {
      font-size: 14px;
      font-weight: bold;
      margin-right: 10px;
      color: #555;
    }

    & > .time {
      font-size: 12.5px;
      color: #555;
    }
  }

  & .content {
    margin: 0;
    
    flex: 1;
    
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #333;
  }
`;
