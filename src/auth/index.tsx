import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';

import { SessionStore } from '../domain/session-store';
import { inject } from '../utils/di';
import { BindAccountFragment } from './bind-account-fragment';
import { Action } from './components/action';
import { Page } from './components/page';
import { CreatePasswordFragment } from './create-password-fragment';
import { EmailAuthFragment } from './email-auth-fragment';
import { PhoneAuthFragment } from './phone-auth-fragment';

@observer
export class Auth extends React.Component {

  @observable
  private authMethod: 'phone' | 'email' = 'phone';

  @inject(SessionStore)
  private sessionStore: SessionStore;

  public componentDidMount(): void {
    // register initialization hooks with when
  }

  public render(): JSX.Element | null {
    if (!this.sessionStore.isReady) {
      return null;
    }

    if (!this.sessionStore.isAuthenticated) {
      return (
        <Page>
          {this.authMethod === 'phone' ? <PhoneAuthFragment/> : <EmailAuthFragment/>}
          <Action onClick={this.changeAuthMethod}>
            Войти с помощью {this.authMethod === 'phone' ? 'email' : 'телефона'}
          </Action>
        </Page>
      );
    }

    if (!this.sessionStore.hasProfile) {
      return (<Page><BindAccountFragment/></Page>);
    }

    if (!this.sessionStore.hasCredential) {
      return (<Page><CreatePasswordFragment/></Page>);
    }

    return <h1>Вы успешно вошли в систему</h1>;
  }

  @action
  private changeAuthMethod = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.authMethod = this.authMethod === 'phone' ? 'email' : 'phone';
  }
  
}
