import * as React from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react';

import { inject } from '../../utils/di';
import { CommonStore } from '../../domain/common-store';

import { Layout } from '../components/layout';
import { Day } from './day';

const DAY_NAMES = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье'
];

@observer
class Menu extends React.Component<{ className?: string }> {

  @inject(CommonStore)
  private commonStore: CommonStore;

  private currentWeekDay: number = (new Date()).getDay();

  public render(): JSX.Element {
    if (!this.commonStore.isActiveUser) {
      return (
        <Layout>
          <div className={this.props.className}>
            <div>
              <p>Нет доступа к программе</p>
            </div>
          </div>
      </Layout>
      );
    }

    return (
      <Layout>
        <div className={this.props.className}>
          <div className="input-container">{}</div>
          {this.renderMenu()}
        </div>
      </Layout>
    );
  }

  private renderMenu(): JSX.Element | null {
    const menu = this.commonStore.menu;

    if (!menu || menu.length === 0) {
      return null;
    }

    const [today, ...otherDays] = menu;
    
    return (
      <div className="menu">
        <div className="item today">
          <div className="name">Сегодня</div>
          <Day menu={today}/>
        </div>
        {otherDays.map((day, index) => (
          <div className="item" key={index}>
            <div className="name">{DAY_NAMES[Math.round((this.currentWeekDay + index) % 7)]}</div>
            <Day menu={day}/>
          </div>
        ))}
      </div>
    );
  }
}

const StyledMenu = styled(Menu)`
  background: #f2f2f2;

  .input-container {
    padding: 32px 15px;
    background: #e6b73f;
  }

  .menu {
    padding: 0 15px;
  }

  .item {
    padding: 8px 15px;
    > .name {
      font-weight: bold;
      color: #555;
      font-size: 14px;
    }

    background: #fff;
    border-radius: 6px;
    margin-bottom: 12px;
    box-shadow: 0 1px 1px 0 rgba(0,0,0,0.10), 
      0 1px 2px 0 rgba(0,0,0,0.12), 0 0px 1px -2px rgba(0,0,0,0.2);

    &.today {
      margin-left: -15px;
      margin-right: -15px;
      border-radius: 0;
    }
  }
`;

export { StyledMenu as Menu };
