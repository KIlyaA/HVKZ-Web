import { Message } from '../domain/chat';
import * as React from 'react';
import styled from 'styled-components';

export interface MessageItemProps {
  message: Message;
  className?: string;
}

const MessageItemStructure: React.SFC<MessageItemProps> = ({ className, message }) => (
  <div className={className}>
    {message.body}
  </div>
);

export const MessageItem = styled(MessageItemStructure)`
  box-sizing: border-box;
  max-width: 80%;
  padding: 5px 6px;
  border-radius: 6px;
  background-color: rgba(243, 218, 142, .8);
  box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
`;
