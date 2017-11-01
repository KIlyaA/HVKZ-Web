import * as React from 'react';
import { observable, action } from 'mobx';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';

import { inject } from '../utils/di';
import { CommonStore } from '../domain/common-store';
import { Group } from '../domain/models';

import { Layout } from './layout';
import { Header } from './header';
import { NoticeInput } from './notice-input';
import { UsersList } from './users-list';

interface Props {
  group?: Group;
}

@observer
@withRouter
export class GroupsEditor extends React.Component<Props> {
  
  @observable
  private notice: string = '';

  @observable.shallow
  private selected: Map<number, number> = new Map();

  @inject(CommonStore)
  private commonStore: CommonStore;

  private get isNew(): boolean {
    return this.props.group == null;
  }

  public constructor(props: Props) {
    super(props);
  }

  public render(): JSX.Element {

    return (
      <Layout>
        <Header isNew={this.isNew} onSaveButtonClick={this.saveChanges} />
        <NoticeInput value={this.notice} onChange={this.changeNotice} />
        <UsersList selected={this.selected} onSelect={this.changeSelected} />
      </Layout>
    );
  }

  @action
  private changeSelected = (id: number): void => {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    }

    this.selected.set(id, id);
  }

  @action
  private changeNotice = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    this.notice = value;
  }

  private saveChanges = (): void => {
    console.log(this.notice, Array.from(this.selected.keys()));
  }
}
