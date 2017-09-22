declare module "react-textarea-autosize" {
  import * as React from 'react';

  interface Props extends React.HTMLProps<HTMLTextAreaElement> {
    maxRows?: number;
  }

  export default class Textarea extends React.Component<Props> {}
}
