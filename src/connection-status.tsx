import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { inject } from './utils/di';
import { CommonStore } from './domain/common-store';
import { Connection } from './domain/connection';
import { ChatsStore } from './domain/chats-store';

@observer
class ConnectionStatus extends React.Component<{ className?: string }> {
  
  @inject(Connection)
  private connection: Connection;

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  public render(): JSX.Element | null {
    if (this.connection.isConnected) {
      return null;
    }

    const classes = this.props.className + 
      (this.connection.isConnecting ? ' action' : '') +
      (this.connection.error ? ' error' : '');

    let content = (
      <span>
        Соединение с сервером не установлено. <a onClick={this.connect}>Установить</a>
      </span>
    );

    if (this.connection.isConnecting) {
      content = (<span>Устанавливаем соединение</span>);
    } else if (this.connection.error) {
      content = (
        <span>
          Не удалось установить соединение. <a onClick={this.connect}>Повторить</a>  
        </span>
      );
    }

    return (<div className={classes}>{content}</div>);
  }

  private connect = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.connection.connect(this.commonStore.currentUserId);
    this.chatsStore.reInitChats();
  }
}

const StyledConnectionStatus = styled(ConnectionStatus)`
  padding: 8px 15px;
  background: #c7c7c7;
  font-size: 12px;
  color: #555;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,0.10), 
  0 1px 2px 0 rgba(0,0,0,0.12), 0 0px 1px -2px rgba(0,0,0,0.2);

  &.error {
    background: #e74c3c;
    color: #f2f2f2;
  }

  a {
    color: inherit;
    cursor: pointer;
    text-decoration: underline;
  }
`;

export { StyledConnectionStatus as ConnectionStatus };
