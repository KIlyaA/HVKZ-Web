import { action, observable, reaction, IReactionDisposer } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { inject } from '../utils/di';
import { Chat } from '../domain/chat';
import { ChatsStore } from '../domain/chats-store';
import { ConnectionStatus } from '../connection-status';
import { UIStore } from '../domain/ui-store';

import { Header } from './header';
import { Input } from './input';
import { Layout } from './layout';
import { MessagesList } from './messages-list';

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

  @inject(UIStore)
  private uiStore: UIStore;

  private disposer: IReactionDisposer;

  public componentWillMount(): void {
    this.setCurrentChat(this.props.match.params.chatName);
  }

  public componentWillReceiveProps(nextProps: ChatViewProps): void {
    this.setCurrentChat(nextProps.match.params.chatName);
  }

  @action
  public componentWillUnmount(): void {
    if (this.chat != null) {
      this.uiStore.isOpenGallery = false;
      this.uiStore.currentImages = [];
      this.chat.leave();
    }
  }

  public render(): JSX.Element | null {
    if (this.chat === void 0) {
      return null;
    }

    return (
      <Layout>
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

    this.uiStore.isOpenGallery = false;
    this.uiStore.currentImages = [];

    chat!.enter();
    this.chat = chat!;

    if (this.disposer) {
      this.disposer();
    }

    this.disposer = reaction(() => chat == null, this.exitChat);
  }

  private exitChat = () => {
    this.props.history.replace('/chats');
  }
}
