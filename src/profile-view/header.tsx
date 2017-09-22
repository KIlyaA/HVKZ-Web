import * as React from 'react';
import styled from 'styled-components';
import { User } from '../domain/user';
import { UserData } from './user-data';

interface Props {
  user: User;
  className?: string;
}

const Header: React.SFC<Props> = ({ user, className }) => (
  <div className={className}>
    <div className="user">
      <img 
        className="avatar"
        src={user.photo || 'https://api.adorable.io/avatars/285/random@adorable.io.png'}
      />
      <div>
        <h1 className="name">{user.name}</h1>
        <span className="group">{user.group.name}</span>
      </div>
    </div>
    <div className="user-info">
      <UserData user={user}/>
    </div>
  </div>
);

const StyledHeader = styled(Header)`
  .user {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    background: #e2bc52;
    padding: 16px 15px 64px 15px;
    color: #fff;

    > .avatar {
      width: 70px;
      height: 70px;
      margin-right: 18px;

      border: 1px solid #83663b;
      border-radius: 50%;
    }

    .name {
      margin: 0;
      font-size: 18px;
      line-height: 24px;
    }

    .group {
      font-size: 14px;
      line-height; 24px;
    }
  }

  .user-info {
    margin-top: -48px;
    padding: 0 15px;
  }
`;

export { StyledHeader as Header };
