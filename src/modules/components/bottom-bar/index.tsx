import styled from 'styled-components';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

import home from './home.svg';
import bell from './bell.svg';
import email from './email.svg';

import homeActive from './home-active.svg';
import bellActive from './bell-active.svg';
import emailActive from './email-active.svg';

const BottomBarStructure: React.SFC<{className?: string }> = (props) => (
  <div className={props.className}>
    <NavLink exact={true} to="/home" activeClassName="active">
      <div className="icon home"/>
      <div>Профиль</div>
    </NavLink>
    <NavLink exact={true} to="/chats" activeClassName="active">
      <div className="icon chats"/>
      <div>Сообщения</div>
    </NavLink>
    <NavLink exact={true} to="/menu" activeClassName="active">
      <div className="icon bell"/>
      <div>Меню</div>
    </NavLink>
  </div>
);

export const BottomBar = styled(BottomBarStructure)`
  box-sizing: border-box;
  box-shadow: 0px 0px 15px 0px rgba(0, 0, 0, 0.14);

  width: 100%;
  padding: 10px 30px;

  background: #fff;
  z-index: 500;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;

  a {
    -webkit-tap-highlight-color: transparent;
    text-decoration: none;
    font-size: 12px;
    text-align: center;
    line-height: 16px;

    color: #555;
  }

  .icon {
    width: 20px;
    height: 20px;
    margin: 0 auto;
    margin-bottom: 2px;
    background-position: center;
  }

  .home {
    background-image: url(${home});
  }

  .chats {
    background-image: url(${email});
  }

  .bell {
    background-image: url(${bell});
  }

  .active {
    color: #e6b73f;

    .home {
      background-image: url(${homeActive});
    }
  
    .chats {
      background-image: url(${emailActive});
    }
  
    .bell {
      background-image: url(${bellActive});
    } 
  }
`;
