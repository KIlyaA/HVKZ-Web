import * as React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  width: 100%;
  height: 100%;

  background-color: rgba(0, 0, 0, 0.95);
  display: flex;

  z-index: 9000;
`;

const Content = styled.div`
  background-color: #fff;
  max-width: 480px;
  width: 80%;
  margin: auto;
  border-radius: 5px;
  overflow: hidden;
`;

interface Props {
  onClose: () => void;
}

export class ModalWindow extends React.Component<Props> {
  
  public render(): JSX.Element | null {
    return (
      <Wrapper onClick={this.handleClose}>
        <Content onClick={this.stopPropagation}>
          {this.props.children}
        </Content>
      </Wrapper>
    );
  }

  private handleClose = (event: React.MouseEvent<HTMLDivElement>) => {
    this.props.onClose();
  }

  private stopPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  }
}
