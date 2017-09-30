import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Chat } from '../../domain/chat';
import { ChatsStore } from '../../domain/chats-store';
import { UsersStore } from '../../domain/users-store';
import { inject } from '../../utils/di';
import { ChatItem } from './chat-item';
import { Group, User } from '../../domain/models';

export interface GroupItemProps {
  group: Group;
  className?: string;
} 

@observer
class GroupItemStructure extends React.Component<GroupItemProps> {

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @computed
  private get admin(): User {
    return this.usersStore.users.get(this.props.group.admin)!;
  }

  @computed
  private get chat(): Chat {
    return this.chatsStore.chats.get(this.props.group.name)!;
  }

  public render(): JSX.Element {
    const { group, className } = this.props;
    return (
      <div className={className}>
        {this.admin && (
          <div className="leader">
            <img
              src={this.admin.photo}
              alt={this.admin.name} 
            />
            <div>
              <div className="role">Куратор:</div>
              <h3 className="name">{this.admin.name}</h3>
              {group.notice && <p className="notice">{group.notice}</p>}
            </div>
          </div>
      )}
      {!!this.chat && (
        <Link
          key={this.chat.id}
          to={'/im/' + this.chat.id} 
        >
            <ChatItem chat={this.chat}/>
        </Link>)}
      </div>
    );
  }
}

export const GroupItem = styled(GroupItemStructure)`
  background: #fff;
  border-radius: 5px;
  border: 1px solid #c0c0c0;
  
  > .leader {
    display: flex;
    flex-flow: row nowrap;
    padding: 12px 15px;
    border-bottom: 1px solid #f2f2f2;

    > img {
      width: 72px;
      height: 72px;
      border-radius: 50%; 
    
      margin-right: 10px;
    }

    .role {
      padding-bottom: 4px;
      font-size: 12.5px;
      line-height: 16px;
    }

    .name {
      margin: 0;
      font-size: 18px;
      line-height: 24px;
    }
  }

  .notice {
    margin: 0;
    font-size: 14px;
  }

  a {
    text-decoration: none;
    display: block;
  }
`;
