import { action, computed, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import ReactList from 'react-list';
import styled from 'styled-components';

import { User } from '../domain/models';
import { UIStore } from '../domain/ui-store';
import { UsersStore } from '../domain/users-store';
import { inject } from '../utils/di';
import { UserItem } from './user-item';

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 16px 30px;

  border: none;
  outline: none;

  border-bottom: 1px solid #f2f2f2;
  color: #555;  
`;

interface Props {
  selected: Map<number, number>;
  onSelect: (id: number) => void;
}

@observer
export class UsersList extends React.Component<Props> {

  @observable
  private query: string = '';

  @observable
  private isLoading: boolean = false;

  @inject(UsersStore)
  private usersStore: UsersStore;

  @inject(UIStore)
  private uiStore: UIStore;

  private timeoutId: number;

  @computed
  private get items() {
    let users: (User | null)[];
    if (this.query === '') {
      users = Array.from(this.props.selected.values())
        .map(id => this.usersStore.users.get(id)!);
    } else {
      users = Array.from(this.usersStore.users.values())
      .filter(user => user
            && (
            this.query === '*'
            || user.uid.toString().includes(this.query)
            || user.name.toLowerCase().includes(this.query)
            || user.user.toLowerCase().includes(this.query)
            || user.email.toLowerCase().includes(this.query)
            || user.phone.includes(this.query))
      );
    }

    return users.sort();
  }

  public render(): JSX.Element {
    return (
      <div className="users-list">
        <Input onChange={this.handleQueryChange} placeholder="id, логин, email или телефон" />
        <ReactList
          itemRenderer={this.renderUser}
          length={this.items.length}
          type="uniform"
        />
      </div>
    );
  }

  private renderUser = (index: number): JSX.Element => {
    const user = this.items[index]!;
    return (
      <UserItem
        key={user.uid}
        user={user}
        onToggle={this.handleToggle}
        selected={this.props.selected}
      />
    );
  }

  private handleToggle = (user: User): void => {
    this.props.onSelect(user.uid);
  }

  private handleQueryChange = (event: React.FormEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => this.changeQuery(value), 300);
  }

  @action.bound
  private async changeQuery(query: string) {
    console.log(!this.uiStore.isAllUsersLoaded && !this.isLoading);
    if (!this.uiStore.isAllUsersLoaded && !this.isLoading) {
      this.isLoading = true;
      await this.usersStore.loadAll();

      runInAction(() => {
        this.uiStore.isAllUsersLoaded = true;
        this.isLoading = false;
      });
    }

    this.query = query.toLowerCase();
  }
}
