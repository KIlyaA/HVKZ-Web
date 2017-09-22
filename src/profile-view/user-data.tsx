import * as React from 'react';
import styled from 'styled-components';

import { User } from '../domain/user';

interface Props {
  user: User;
  className?: string;
}

const UserData: React.SFC<Props> = ({ user, className }) => (
  <table className={className}>
    <tbody>
      <tr className="row">
        <td className="item">
          <div className="title">Грудь</div>
          <div className="value">{user.parameters.chest}</div>
        </td>
        <td className="item">
          <div className="title">Под грудью</div>
          <div className="value">{user.parameters.underchest}</div>
        </td>
        <td className="item">
          <div className="title">Талия</div>
          <div className="value">{user.parameters.waistCirc}</div>
        </td>
        <td className="item">
          <div className="title">Таз</div>
          <div className="value">{user.parameters.girthPelvis}</div>
        </td>
        <td className="item">
          <div className="title">Ягодицы</div>
          <div className="value">{user.parameters.girthButtocks}</div>
        </td>
      </tr>
      <tr className="row">  
        <td className="item">
          <div className="title">Бедра</div>
          <div className="value">{user.parameters.hipCirc}</div>
        </td>
        <td className="item">
          <div className="title">Рост</div>
          <div className="value">{user.parameters.growth}</div>
        </td>
        <td className="item">
          <div className="title">Вес</div>
          <div className="value">{user.parameters.weight}</div>
        </td>
        <td className="item">
          <div className="title">ИМТ</div>
          <div className="value">{}</div>
        </td>
        <td className="item">
          <div className="title">Цель</div>
          <div className="value">{user.parameters.desiredWeight}</div>
        </td>
      </tr>
    </tbody>
  </table>
);

const StyledUserData = styled(UserData)`
  border-collapse: collapse;
  width: 100%;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,0.10), 
    0 1px 2px 0 rgba(0,0,0,0.12), 0 0px 1px -2px rgba(0,0,0,0.2);
  
  .row:first-child {
    border-bottom: 1px solid #f2f2f2;
  }

  .item {
    border-collapse: collapse;
    box-sizing: border-box;

    padding: 6px;
    text-align: center;
    color: #555;

    &:not(:first-child) {
      border-left: 1px solid #f2f2f2;
    }

    > .title {
      font-size: 14px;
    }

    > .value {
      height: 32px;
      font-size: 20px;
      line-height: 32px;
    }
  }
`;

export { StyledUserData as UserData };
