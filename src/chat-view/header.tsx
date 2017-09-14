import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Strophe } from 'strophe.js';
import styled from 'styled-components';

import { Chat } from '../domain/chat';
import { GroupsStore } from '../domain/groups-store';
import { User } from '../domain/user';
import { UsersStore } from '../domain/users-store';
import { inject } from '../utils/di';
import arrow from './arrow-left.svg';

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  box-sizing: border-box;
  width: 100%;
  height: 64px;
  padding: 0 15px;

  background: #fff; 
  border-bottom: 2px solid #e6b73f; 
  box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.18); 
`;

const BackArrow = styled.div`
  width: 22px;
  height: 22px;

  margin-right: 15px;
  cursor: pointer;

  background-image: url(${arrow});
  background-size: 22px 22px;
  background-position: center;
  background-repeat: no-repeat;  
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
`;

const Info = styled.div`
  padding: 0 15px;
  flex: 1;

  .name {
    margin: 0;
  }

  .status {
    margin: 0;
    color: #555;
    font-size: 12px;
    line-height: 18px;
  }
`;

interface HeaderProps {
  chat: Chat;
}

@withRouter
export class Header extends React.Component<HeaderProps> {

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  private get user(): User | null | undefined {
    if (!this.props.chat) {
      return null;
    }

    const chatName = Strophe.getNodeFromJid(this.props.chat.jid);
    const userId = this.props.chat.type === 'groupchat'
      ? this.groupsStore.groups.get(chatName)!.admin
      : Number(chatName);

    return this.usersStore.users.get(userId);
  }

  private get router(): RouteComponentProps<{}> {
    // tslint:disable-next-line:no-any
    return this.props as any;
  }

  public render(): JSX.Element | null {
    const name = this.user ? this.user.name : 'Неизвестный пользователь';
    const avatarUrl = this.user ? this.user.photo :       
      'https://api.adorable.io/avatars/285/random@adorable.io.png';

    return (
      <Wrapper>
        <BackArrow onClick={this.handleGoToBack}/>
        <Info>
          <p className="name">{name}</p>
          <p className="status">{this.getStatus()}</p>
        </Info>
        <Avatar src={avatarUrl}/>
      </Wrapper>
    );
  }

  private handleGoToBack = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    this.router.history.push('/chats');
  }

  private getStatus(): string {
    const chatName = Strophe.getNodeFromJid(this.props.chat.jid);

    if (this.props.chat.type === 'chat') {
      return 'В сети';
    } else {
      const count = this.groupsStore.groups.get(chatName)!.members.length;
      return count + ' участников'; 
    }
  }
}
