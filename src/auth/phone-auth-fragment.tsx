import * as Firebase from 'firebase';
import { action, observable, computed } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { Action } from './components/action';
import { Form } from './components/form';
import { Input, MaskedInput } from './components/input';
import { Lead } from './components/lead';
import { Submit } from './components/submit';
import { Title } from './components/title';
import { Error } from './components/error';

// tslint:disable-next-line:no-any
declare var grecaptcha: any;

@observer
export class PhoneAuthFragment extends React.Component {

  @observable
  private error?: string;

  @observable
  private inProgress: boolean = false;

  private phoneNumber: string;
  private verificationCode: string;

  private verifierContainer: HTMLElement;
  private verifier: Firebase.auth.RecaptchaVerifier;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @inject(Firebase.app)
  private firebaseApplication: Firebase.app.App;

  @computed
  private get canSendCode(): boolean {
    return this.sessionStore.requestCodeTimeout === 0;
  }

  public componentDidMount(): void {
    this.verifierContainer = document.createElement('div');
    document.body.appendChild(this.verifierContainer);

    this.verifier = new Firebase.auth.RecaptchaVerifier(
      this.verifierContainer, { size: 'invisible' }, this.firebaseApplication);
  }

  public componentWillUnmount(): void {
    this.verifier.clear();
    this.verifierContainer.remove();
  }

  public render() {
    return this.sessionStore.codeSent ?
      this.renderCheckCodeForm() : this.renderSendCodeForm();
  }

  private renderSendCodeForm(): JSX.Element {
    return (
      <Form onSubmit={this.sendCode}>
        <Title>Вход в систему</Title> 
        <Lead>
          Для входа в систему введите свой номер, на который мы вышлем
          бесплатное SMS с кодом подтверждения
        </Lead>
        <MaskedInput
          name="phone"
          type="tel"
          mask="+7 999 999 99 99"
          maskChar=""
          required={true}
          placeholder="Введите номер телефона"
          onChange={e => this.phoneNumber = e.currentTarget.value}
        />
        {this.error && <Error>{this.error}</Error>}
        <Submit disabled={this.inProgress}>
          {this.inProgress ? 'Высылаем код' : 'Отправить код'}
        </Submit>
      </Form>
    );
  }

  private renderCheckCodeForm(): JSX.Element {
    return (
      <Form onSubmit={this.checkCode}>
        <Title>Подтверждение номера телефона</Title> 
        <Lead>
          На Ваш номер телефона было выслано SMS с кодом подтверждения,
          который нужно ввести ниже.
        </Lead>
        <Input
          type="text"
          name="verificationCode"
          required={true}
          placeholder="Введите код подтверждения"
          onChange={e => this.verificationCode = e.currentTarget.value}
        />
        {this.error && <Error>{this.error}</Error>}
        <Submit disabled={this.inProgress}>Войти</Submit>
        {this.canSendCode &&
          <Action onClick={this.sendCode}>Отправить код повторно</Action>}
      </Form>
    );
  }

  @action
  private sendCode = (event: React.SyntheticEvent<HTMLAnchorElement | HTMLFormElement>) =>  {
    event.preventDefault();

    this.error = void 0;
    this.inProgress = true;

    this.verifier.render().then(id => grecaptcha.reset(id));
    this.sessionStore.sendCode(this.phoneNumber, this.verifier)
      .then(this.onResolved, this.onResolved);
  }

  @action
  private checkCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.error = void 0;
    this.inProgress = true;

    this.sessionStore.signInWithCode(this.verificationCode)
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
