import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Chat } from '../domain/chat';
import { ChatsStore } from '../domain/chats-store';
import { inject } from '../utils/di';
import { Header } from './header';
import { Input } from './input';
import { Layout } from './layout';
import { MessagesList } from './messages-list';
import { LightBox } from './lightbox';
import { ConnectionStatus } from '../connection-status';

interface ChatViewProps extends RouteComponentProps<{
  chatName: string;
}> {}

@withRouter
@observer
export class ChatView extends React.Component<ChatViewProps> {

  @observable
  private chat: Chat;

  @inject(ChatsStore)
  private chatsStore: ChatsStore;

  public componentWillMount(): void {
    this.setCurrentChat(this.props.match.params.chatName);
  }

  public componentWillReceiveProps(nextProps: ChatViewProps): void {
    this.setCurrentChat(nextProps.match.params.chatName);
  }

  public componentWillUnmount(): void {
    if (this.chat != null) {
      this.chat.leave();
    }
  }

  public render(): JSX.Element | null {
    if (this.chat === void 0) {
      return null;
    }

    return (
      <Layout>
        <LightBox/>
        <Header chat={this.chat}/>
        <ConnectionStatus/>
        <MessagesList chat={this.chat}/>
        <Input chat={this.chat}/>
      </Layout>
    );
  }

  @action
  private setCurrentChat(chatName: string): void {
    const chat = this.chatsStore.chats.get(chatName);

    if (chat === void 0) {
      this.props.history.replace('/chats');
      return;
    } else if (this.chat === chat) {
      return;
    }

    chat!.enter();
    this.chat = chat!;
  }
}
