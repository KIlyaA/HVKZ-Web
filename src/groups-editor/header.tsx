import * as React from 'react';
import { withRouter } from 'react-router';
import styled from 'styled-components';

import arrow from './arrow-left.svg';
import yes from './yes.svg';

const Wrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  box-sizing: border-box;
  width: 100%;
  height: 64px;
  border-bottom: 2px solid #e6b73f;

  background: #fff;
`;

const BackArrow = styled.div`
  width: 24px;
  height: 24px;

  margin-left: 15px;
  cursor: pointer;

  background-image: url(${arrow});
  background-size: 24px 24px;
  background-position: center;
  background-repeat: no-repeat;
`;

const SaveIcon = styled.div`
  width: 64px;
  height: 64px;

  cursor: pointer;

  background-color: #e6b73f;
  background-image: url(${yes});
  background-size: 36px 36px;
  background-position: center;
  background-repeat: no-repeat;
`;

const Info = styled.div`
  margin: 0 15px;
  flex: 1;

  font-size: 18px;
  line-height: 24px;
  color: #555;

  white-space: nowrap;
  overflow: hidden;
  box-sizing: border-box;
  }
`;

interface HeaderProps {
  isNew: boolean;
  onSaveButtonClick: () => void;
}

@withRouter
export class Header extends React.Component<HeaderProps> {
  public render(): JSX.Element {
    return (
      <Wrapper>
        <BackArrow onClick={this.handleGoToBack} />
        <Info>{this.props.isNew ? 'Создание группы' : 'Редактирование группы'}</Info>
        <SaveIcon onClick={this.handleSaveClick} />
      </Wrapper>
    );
  }

  private handleGoToBack = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // tslint:disable-next-line:no-any
    (this.props as any).history.goBack();
  }

  private handleSaveClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    this.props.onSaveButtonClick();
  }
}
