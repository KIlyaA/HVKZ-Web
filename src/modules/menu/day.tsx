import * as React from 'react';
import styled from 'styled-components';

import { MenuItem } from '../../domain/models';

interface Props {
  menu: MenuItem;
  className?: string;
}

const Day: React.SFC<Props> = ({ className, menu }) => (
  <div className={className}>
    <table className="times">
      <tbody>
        <tr className="day">
          <td className="title">На завтрак <div>(09:00 - 10:00)</div></td>
          <td className="value">{menu.dayArray[0]}</td>
        </tr>
        <tr className="day">
          <td className="title">На перекус <div>(11:30 - 12:00)</div></td>
          <td className="value">{menu.dayArray[1]}</td>
        </tr>
        <tr className="day">
          <td className="title">На обед <div>(13:00 - 14:00)</div></td>
          <td className="value">{menu.dayArray[2]}</td>
        </tr>
        <tr className="day">
          <td className="title">На полдник <div>(16:00 - 16:30)</div></td>
          <td className="value">{menu.dayArray[3]}</td>
        </tr>
        <tr className="day">
          <td className="title">На ужин <div>(19:00 - 20:00)</div></td>
          <td className="value">{menu.dayArray[4]}</td>
        </tr>
      </tbody>
    </table>
    <div className="info">
      <span>Белки  <span className="number">{menu.bzu[0]}</span></span>
      <span>Жиры  <span className="number">{menu.bzu[1]}</span></span>
      <span>Углеводы  <span className="number">{menu.bzu[2]}</span></span>
    </div>
  </div>
);

const StyledDay = styled(Day)`
  > .info {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    padding: 8px 0;
    border-top: 1px solid #f2f2f2;

    font-size: 14px;
    color: #999;

    .number {
      color: #555;
    }
  }

  .times {
    border-collapse: collapse;
    border-bottom: 8px;
  }

  .day {

    &:not(:last-child) {
      border-bottom: 1px solid #f2f2f2;
    }

    > .title {
      padding: 8px 0;
      font-size: 14px;
      padding-right: 15px;
      word-wrap: normal;
      white-space: nowrap;

      > div {
        color: #999;
        font-size: 12px;
      }
    }

    > .value {
      padding: 8px 0;
      font-size: 14px;
    }
  }
`;

export { StyledDay as Day };
