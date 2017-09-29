import { Title } from './components/title';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { Form } from './components/form';
import { Input } from './components/input';
import { Lead } from './components/lead';
import { Submit } from './components/submit';
import { Error } from './components/error';

@observer
export class BindAccountFragment extends React.Component {
  
  private emailInput: HTMLInputElement;

  @observable
  private error?: string;

  @observable
  private inProgress: boolean = false;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  public render(): JSX.Element {
    return (
      <Form onSubmit={this.bindProfile}>
        <Title>Синхронизация с анкетой</Title>
        <Lead>
          Для доступа к приложению необходимо выполнить синхронизацию аккаунта с 
          Вашей анкетой на сайте. Для этого укажите email, с помощью которого вы 
          зарегистрировались на нашем сайте hvkz.org. Учтите, что номер телефона 
          в анкете должен совпадать с номером телефона данного аккаунта
        </Lead>
        <Input
          name="email"
          type="text"
          required={true}
          placeholder="Введите email"
          innerRef={ref => { this.emailInput = ref; }}
        />
        {this.error && <Error>{this.error}</Error>}
        <Submit disabled={this.inProgress}>Далее</Submit>
      </Form>
    );
  }

  private bindProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.error = void 0;
    this.inProgress = true;

    this.sessionStore.bindProfile(this.emailInput.value)
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
