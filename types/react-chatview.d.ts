declare module "react-chatview" {

  import * as React from 'react';

  export interface ChatViewProps {
    className?: string;
    flipped: boolean;
    reversed?: boolean;
    scrollLoadThreshold?: number;

    shouldTriggerLoad: () => boolean;
    onInfiniteLoad: () => void;
  }

  export default class ChatView extends React.Component<ChatViewProps> {}
}
