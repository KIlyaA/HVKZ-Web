import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import ChatView from 'react-chatview';
import styled from 'styled-components';

import { Chat, Message } from '../domain/chat';
import background from './background.png';
import { MessageItem } from './message-item';

interface MessagesListProps {
  chat: Chat;
  className?: string;
}

@observer
class MessagesList extends React.Component<MessagesListProps> {

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
        {this.messages.map((message) => (
          <div key={message.timestamp} className="box">
            <MessageItem message={message} />
          </div>
        ))}
      </ChatView>
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
  flex: 1;
  background: #f5f5f5 url(${background}) repeat;
  padding: 12px 15px;

  .box {
    margin-bottom: 6px;
  }
`;

export { StyledMessagesList as MessagesList };
