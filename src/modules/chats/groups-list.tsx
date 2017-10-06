import { computed, action } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';
import Slider, { SiemaSliderProps }  from 'react-siema';

import { GroupsStore } from '../../domain/groups-store';
import { UIStore } from '../../domain/ui-store';
import { inject } from '../../utils/di';
import { GroupItem } from './group-item';

import clock from './clock.svg';
import { Group } from '../../domain/models';

@observer
class GroupsListStructure extends React.Component<{ className?: string }> {

  @inject(GroupsStore)
  private groupsStore: GroupsStore;

  @inject(UIStore)
  private uiStore: UIStore;

  private sliderOptions: SiemaSliderProps = {
    draggable: true,
    duration: 250,
    easing: 'ease-out',
    threshold: 20,
    perPage: 1,
    resizeDebounce: 200,
    startIndex: this.uiStore.currentSlide,

    onChange: action((e) => {
      this.uiStore.currentSlide = e as number;
    })
  };

  @computed
  private get groups(): Group[] {
    const groups: Group[] = [];

    this.groupsStore.groups.forEach(group => {
        groups.push(group);
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
          className={this.uiStore.currentSlide === i ? 'active' : ''}
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
  padding-bottom: 12px;
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
