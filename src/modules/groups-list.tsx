import { computed, action } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import Slider, { SiemaSliderProps }  from 'react-siema';

import { Group, GroupsStore } from '../domain/groups-store';
import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { GroupItem } from './group-item';

import clock from './clock.svg';

@observer
class GroupsListStructure extends React.Component<{ className?: string }> {

  private static currentGroup: number = 0;

  private sliderOptions: SiemaSliderProps = {
    draggable: true,
    duration: 250,
    easing: 'ease-out',
    threshold: 20,
    perPage: 1,
    resizeDebounce: 200,
    startIndex: GroupsListStructure.currentGroup,

    onChange: action((e) => {
      GroupsListStructure.currentGroup = e as number;
    })
  };

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @computed
  private get groups(): Group[] {
    const groups: Group[] = [];
    const userId = this.sessionStore.currentUserId;

    this.groupsStore.groups.forEach(group => {
      if (group.admin === userId || group.members.indexOf(userId!) !== -1) {
        groups.push(group);
      }
    });

    return groups;
  }

  public render(): JSX.Element | null {
    const groups = this.groups.map(group => (
      <div key={group.name}><GroupItem group={group}/></div>
    ));

    if (groups.length === 0) {
      return (
        <div className={this.props.className}>
          {this.renderNoGroupsMessage()}
        </div>
      );
    }

    return (
      <div className={this.props.className}>
        {groups.length === 1
          ? (<div>{groups}</div>)
          : (<Slider {...this.sliderOptions}>{groups}</Slider>)
        }
        {this.renderDots()}
      </div>
    );
  }

  private renderNoGroupsMessage(): JSX.Element {
    return (
      <div className="nogroups">
        <img src={clock} alt=""/>
        <p>Вам пока ещё не назначили куратора. Вы можете подождать 
        или задать вопрос нашему оператору, он всегда находится в списке 
        Ваших диалогов ниже</p>
      </div>
    );
  }

  private renderDots(): JSX.Element {
    const dots: JSX.Element[] = [];

    for (let i = 0; i < this.groups.length; i++) {
      dots.push(
        <li
          key={i}
          className={GroupsListStructure.currentGroup === i ? 'active' : ''}
        >
          <button>{i}</button>
        </li>
      );
    }

    return (
      <ul className="dots">{dots}</ul>
    );
  }
}

export const GroupList = styled(GroupsListStructure)`
  background: #e6b73f;
  padding: 12px;
  border-bottom: 1px solid #f2f2f2;

  .dots {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex !important;
    flex-flow: row nowrap;
    justify-content: center;
    line-height: 8px;

    li {
      line-height: 8px;
      height: 8px;
      :not(:last-child) {
        margin-right: 4px;
      }
    }

    button {
      outline: none;
      font-size: 0;
      width: 6px;
      height: 6px;
      padding: 0;
      border: 1px solid #fff;
      border-radius: 50%;

      background: transparent;
    }

    .active button {
      background: #fff;
    }
  }

  .nogroups {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    
    box-sizing: border-box;
    width: 100%;
    padding: 5px 15px;

    img {
      width: 256px;
      height: 64px;
    }
    
    p {
      color: #fff;
      text-align: center;
      margin: 0;
      font-size: 14px;
    }
  }
`;
