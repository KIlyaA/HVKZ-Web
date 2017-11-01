import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { get } from '../utils/di';
import { CommonStore } from '../domain/common-store';
import { User } from '../domain/models';

import plus from './plus.svg';
import minus from './minus.svg';

interface Props {
  user: User;
  
  selected: Map<number, number>;
  onToggle: (user: User) => void;

  className?: string;
}

const commonStore: CommonStore = get(CommonStore);

@observer
class UserItem extends React.Component<Props> {

  public render(): JSX.Element {
    const { user, selected, onToggle, className } = this.props;

    return (
      <div className={className}>
        <div className="avatar" style={{ backgroundImage: `url(${user.photo})`}} />
        <div className="info">
          <p className="name">{user.name}</p>
          <p className="phone">{user.phone}</p>
          <p className="email">{user.email}</p>
        </div>
        <div
          onClick={this.handleClick}
          className="icon"
          style={{ backgroundImage: `url(${selected.has(user.uid) ? minus : plus})`}}
        />
      </div>
    );
  }

  private handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    this.props.onToggle(this.props.user);
  }
}

const StyledUserItem = styled(UserItem)`
  box-sizing: border-box;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  align-content: center;

  &:not(:last-child) {
    border-bottom: 1px solid #f5f5f5;
  }

  > .avatar {
    width: 64px;
    height: 64px;

    background-repeat: no-repeat;
    background-size: cover;

    border-radius: 50%;
    display: block;
  }

  .info {
    box-sizing: border-box;
    padding: 0 15px;
    flex: 1;

    > p {
      margin: 0;
      font-size: 14px;
      color: #555;
    }

    > .name {
      font-weight: bold;
    }

    .phone {
      color: #333;
    }
  }

  > .icon {
    cursor: pointer;
    width: 24px;
    height: 24px;
    background-position: center;
    background-size: 24px 24px
  }
`;

export { StyledUserItem as UserItem };
