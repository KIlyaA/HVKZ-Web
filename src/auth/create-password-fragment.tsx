import { Action } from './components/action';
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
import { Error } from './components/error';

export interface CreatePasswordFragmentProps {
  onComplete: () => void;
}

@observer
export class CreatePasswordFragment extends React.Component<CreatePasswordFragmentProps> {
  
  private passwordInput: HTMLInputElement;

  @observable
  private error?: string;

  @observable
  private inProgress: boolean = false;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  public render(): JSX.Element {
    return (
      <Form onSubmit={this.createPassword}>
        <Title>Установка пароля</Title>
        <Lead>
          Мы почти закончили, осталось установить пароль. Вы можете 
          использовать для приложения такой же пароль как на сайте
        </Lead>
        <Input
          name="password"
          type="password"
          required={true}
          placeholder="Введите пароль"
          innerRef={ref => { this.passwordInput = ref; }}
        />
        {this.error && <Error>{this.error}</Error>}
        <Submit disabled={this.inProgress}>Далее</Submit>
        <Action
          onClick={(e) => { e.preventDefault(); this.props.onComplete(); }}
        >
          Создать пароль позже
        </Action>
      </Form>
    );
  }

  private createPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.error = void 0;
    this.inProgress = true;

    this.sessionStore.createOrUpdatePassword(this.passwordInput.value)
      .then(this.onResolved, this.onResolved);
  }

  @action
  private onResolved = (error?: Error | void) => {
    this.inProgress = false;

    if (error != null) {
      this.error = error.message;
      return;
    }
    
    this.props.onComplete();
  }
}
