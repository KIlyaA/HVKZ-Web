import * as React from 'react';
import styled from 'styled-components';

import { inject } from '../../utils/di';
import { unknownUser, UsersStore } from '../../domain/users-store';
import { FWD } from '../../domain/models';

const getMonth = (index: number): string => {
  switch (index) {
    case 0: return 'января';
    case 1: return 'февраля';
    case 2: return 'марта';
    case 3: return 'апреля';
    case 4: return 'мая';
    case 5: return 'июня';
    case 6: return 'июля';
    case 7: return 'августа';
    case 8: return 'сентября';
    case 9: return 'октября';
    case 10: return 'ноября';
    case 11: return 'декабря';
    default: return '13-ого месяца';
  }
};

class ForwadedMessage extends React.Component<{ className?: string, message: FWD }> {
  
  @inject(UsersStore)
  private usersStore: UsersStore;

  public render(): JSX.Element | null {
    const { className, message } = this.props;
    const user = this.usersStore.users.get(message.sender) || unknownUser;

    const date = new Date(message.timestamp * 1000);
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
    const time = `${date.getDate()} ${getMonth(date.getMonth())} в ${date.getHours()}:${minutes}`;

    return (
      <div className={className}>
        <div className="info">
          <img src={user.photo || 'https://api.adorable.io/avatars/285/random@adorable.io.png'}/>
          <div>
            <div className="name">{this.getSenderName(user.name)}</div>
            <div className="time">{time}</div>
          </div>
        </div>
        <p className="body">{message.message}</p>
      </div>
    );
  }

  private getSenderName(name: string): string {
    const segments = name.split(/\s+/g);

    if (!segments[1] || !segments[2]) {
      return segments[0] || 'Неизвестный';
    }

    return (segments[1] || '') + ' ' + (segments[2] || '');
  }

}

const StyledForwadedMessage = styled(ForwadedMessage)`
  &:not(:last-child) {
    margin-bottom: 8px;
  }

  .info {
    display: flex;
    
    > img {
      display: inline-block;
      margin-right: 10px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
    }

    .name {
      font-size: 12px;
      font-weight: bold;
      line-height: 18px;      
      color: #555;
    }

    .time {
      font-size: 10px;
      line-height: 10px;
      color: #c7c7c7;
    }
  }

  > .body {
    padding: 4px 0;
    margin: 0;
    font-size: 14px;
  }
`;

export { StyledForwadedMessage as ForwadedMessage };
