import { computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import Slider from 'react-slick';

import { Group, GroupsStore } from '../domain/groups-store';
import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { GroupItem } from './group-item';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

@observer
class GroupsListStructure extends React.Component<{ className?: string }> {

  private static SLIDER_OPTIONS = {
    dots: true,
    arrows: false,
    infinite: false,
    swipe: true,
    dotsClass: 'dots'
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

  public render(): JSX.Element {
    const groups = this.groups.map(group => (
      <div key={group.name}><GroupItem group={group}/></div>
    ));

    return (
      <div className={this.props.className}>
        {groups.length > 0 && (
          groups.length === 1
            ? (<div>{groups}</div>)
            : <Slider {...GroupsListStructure.SLIDER_OPTIONS}>{groups}</Slider>
        )}
      </div>
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

    .slick-active button {
      background: #fff;
    }
    
  }
`;
