import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import styled, { keyframes } from 'styled-components';

import { Chat } from '../domain/chat';
import { GroupsStore } from '../domain/groups-store';
import { unknownUser, UsersStore } from '../domain/users-store';
import { inject } from '../utils/di';
import { declOfNum } from '../utils/decl-of-num';
import arrow from './arrow-left.svg';
import { User } from '../domain/models';

import { TypingIndicator } from '../typing-indicator';

const marquee = keyframes`
  0%   { transform: translate(0, 0); }
  100% { transform: translate(-80%, 0); }
`;

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
  margin: 0 15px;
  flex: 1;
  
  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;

  .name {
    margin: 0;
    overflow: hidden;

    &.marquee > span {
      display: inline-block;
      animation: ${marquee} 10s linear infinite;
    }
  }

  .status {
    margin: 0;
    color: #555;
    font-size: 12px;
    line-height: 18px;

    > ${TypingIndicator} {
      display: inline-block;
    }
  }
`;

interface HeaderProps {
  chat: Chat;
}

@withRouter
export class Header extends React.Component<HeaderProps> {

  private nameContainer: HTMLElement;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  private get user(): User {
    if (!this.props.chat) {
      return unknownUser;
    }

    const chatName = this.props.chat.id;
    const userId = this.props.chat.type === 'groupchat'
      ? this.groupsStore.groups.get(chatName)!.admin
      : Number(chatName);

    return this.usersStore.users.get(userId) || unknownUser;
  }

  private get router(): RouteComponentProps<{}> {
    // tslint:disable-next-line:no-any
    return this.props as any;
  }

  public componentDidMount(): void {
    const overflowX = this.nameContainer.offsetWidth < this.nameContainer.scrollWidth;
    const overflowY = this.nameContainer.offsetHeight < this.nameContainer.scrollHeight;

    if (overflowX || overflowY) {
      this.nameContainer.className = this.nameContainer.className + ' marquee';
    }
  }

  public render(): JSX.Element | null {
    return (
      <Wrapper>
        <BackArrow onClick={this.handleGoToBack}/>
        <Info>
          <p className="name" ref={el => this.nameContainer = el!}>
            <span>{this.user.name}</span>
          </p>
          <p className="status">{this.getStatus()}</p>
        </Info>
        <Avatar src={this.user.photo}/>
      </Wrapper>
    );
  }

  private handleGoToBack = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    this.router.history.push('/chats');
  }

  private getStatus(): string | JSX.Element {
    const chatName = this.props.chat.id;

    if (this.props.chat.isComposing) {
      return <TypingIndicator/>;
    }

    if (this.props.chat.type === 'chat') {
      return 'В сети';
    } else {
      const count = this.groupsStore.groups.get(chatName)!.members.length;
      return count + ' ' + declOfNum(count, ['участник', 'участника', 'участников']); 
    }
  }
}
