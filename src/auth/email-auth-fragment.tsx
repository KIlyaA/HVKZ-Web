import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { Form } from './components/form';
import { Input } from './components/input';
import { Lead } from './components/lead';
import { Submit } from './components/submit';
import { Title } from './components/title';

@observer
export class EmailAuthFragment extends React.Component {

  @observable
  private error?: string;

  @observable
  private inProgress: boolean = false;

  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  public render(): JSX.Element {
    return (
      <Form onSubmit={this.signIn}>
        <Title>Вход в систему</Title>
        <Lead>
          Что-то про вход при помощи почты и пароля
        </Lead>
        <Input
          name="email"
          type="email"
          required={true}
          placeholder="Введите email"
          innerRef={ref => { this.emailInput = ref; }}
        />
        <Input
          name="password"
          type="password"
          required={true}
          placeholder="Введите пароль"
          innerRef={ref => { this.passwordInput = ref; }}
        />
        <Submit disabled={this.inProgress}>Войти</Submit>
      </Form>
    );
  }

  private signIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    this.error = void 0;
    this.inProgress = true;

    this.sessionStore.signInWithEmail(email, password)
      .then(this.onResolved, this.onResolved);
  }

  @action
  private onResolved = (error?: Error | void) => {
    this.inProgress = false;

    if (error != null) {
      this.error = error.message;    
    } 
  }
}
