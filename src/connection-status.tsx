import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { inject } from './utils/di';
import { CommonStore } from './domain/common-store';
import { XMPP } from './domain/xmpp/index';
import { ConnectionStatus as XMPPStatus } from './domain/xmpp/connection-status';

@observer
class ConnectionStatus extends React.Component<{ className?: string }> {
  
  @inject(XMPP)
  private xmpp: XMPP;

  @inject(CommonStore)
  private commonStore: CommonStore;

  public render(): JSX.Element | null {
    if (this.xmpp.status === XMPPStatus.CONNECTED) {
      return null;
    }

    const classes = this.props.className + 
      (this.xmpp.status === XMPPStatus.CONNECTING ? ' action' : '') +
      (this.xmpp.status === XMPPStatus.FAILED ? ' error' : '');

    let content = (
      <span>
        Соединение с сервером не установлено. <a onClick={this.connect}>Установить</a>
      </span>
    );

    if (this.xmpp.status === XMPPStatus.CONNECTING) {
      content = (<span>Устанавливаем соединение</span>);
    } else if (this.xmpp.status === XMPPStatus.FAILED) {
      content = (
        <span>
          Не удалось подключиться к серверу. <a onClick={this.connect}>Повторить</a>  
        </span>
      );
    }

    return (<div className={classes}>{content}</div>);
  }

  private connect = (event: React.SyntheticEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    console.log('TRY CONNECT');
    this.xmpp.connect(this.commonStore.currentUserId);
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
