import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';
import { computed } from 'mobx';

import { inject } from '../../utils/di';
import { UIStore } from '../../domain/ui-store';
import { Message } from '../../domain/chat';
import { User } from '../../domain/user';

import { Images } from './images';
import { ForwadedMessage } from './forwaded';

export interface MessageItemProps {
  message: Message;
  user: User;
  isOut: boolean;
  showAvatar: boolean;

  className?: string;
}

@observer
class MessageItemStructure extends React.Component<MessageItemProps> {

  @inject(UIStore)
  private uiStore: UIStore;

  private messageId: string = btoa(
    this.props.message.timestamp.toString() + 
    this.props.message.senderId.toString() + 
    Date.now().toString());

  @computed
  private get isSelect(): boolean {
    return this.uiStore.selectedMessages.has(this.messageId);
  }

  public render(): JSX.Element | null {
    const { className, message, isOut, showAvatar, user } = this.props;

    const date = new Date(message.timestamp * 1000);
    const time = date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    const classes = className + (isOut ? ' out' : '')  + (this.isSelect ? ' selected' : ''); 
  
    return (
      <div className={classes}>
        <div className="info">
          {(!isOut && showAvatar)  && <img className="avatar" src={user.photo} alt="" />}
          {(!showAvatar || isOut)  && <div className="time">{time}</div>}
        </div>
        <div className="body" onClick={this.handleClick}>
          {message.body}
          {message.images.length > 0 && <Images urls={message.images} />}
          {message.forwarded.length > 0 && (
            <div className="fwd-container">
              {message.forwarded.map(fwd => <ForwadedMessage key={fwd.timestamp} message={fwd}/>)}
            </div>
          )}
        </div>
      </div>
    );
  }

  private handleClick = (event: React.SyntheticEvent<HTMLElement>) => {
    if (this.props.message.body.length !== 0) {
      if (this.isSelect) {
        this.uiStore.selectedMessages.delete(this.messageId);
      } else {
        this.uiStore.selectedMessages.set(this.messageId, this.props.message);
      }
    }
  }
}

export const MessageItem = styled(MessageItemStructure)`
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: flex-start;

  > .info {
    width: 26px;
    margin-right: 12px;
    text-align: center;

    .avatar {
      display: block;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      margin-bottom: 2px;
    }

    .time {
      font-size: 10px;
      line-height: 12px;
      color: #cecece;
    }
  }

  > .body {
    color: #555;
    font-size: 14px;
    line-height: 24px;
    padding: 8px;
    border-radius: 5px;
    background-color: #fff;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,0.10), 
      0 1px 2px 0 rgba(0,0,0,0.12), 0 0px 1px -2px rgba(0,0,0,0.2);
    min-height: 24px;

    max-width: 80%;
    cursor: pointer;

    > .fwd-container {
      box-sizing: border-box;
      margin-top: 8px;
      padding-left: 10px;
      border-left: 2px solid #f2f2f2;
    }
  }

  &.out {
    > .body {
      margin-left: auto;
      background: #fffcd7;
    }
  }

  &.selected {
    > .body {
      background: #f2f2f2;
    }
  }
`;
