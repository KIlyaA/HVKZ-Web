import { action, observable, when } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import { withRouter } from 'react-router';

import { SessionStore } from '../domain/session-store';
import { CommonStore } from '../domain/common-store';
import { inject } from '../utils/di';
import { BindAccountFragment } from './bind-account-fragment';
import { Action } from './components/action';
import { Page } from './components/page';
import { CreatePasswordFragment } from './create-password-fragment';
import { EmailAuthFragment } from './email-auth-fragment';
import { PhoneAuthFragment } from './phone-auth-fragment';
import { Loader } from './components/loader';

@withRouter
@observer
export class Auth extends React.Component {

  @observable
  private authMethod: 'phone' | 'email' = 'phone';

  @observable
  private hasPassword: boolean = false;

  @inject(SessionStore)
  private sessionStore: SessionStore;

  @inject(CommonStore)
  private commonStore: CommonStore;

  public componentDidMount(): void {
    when(() => this.sessionStore.isAuthenticated, action(() => {
      this.hasPassword = this.sessionStore.hasProfile;
    }));
  }

  public render(): JSX.Element | null {
    if (!this.sessionStore.isReady) {
      return <Loader/>;
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

    if (!this.sessionStore.hasProfile || !this.hasPassword) {
      if (!this.sessionStore.hasProfile) {
        return (<Page><BindAccountFragment/></Page>);
      }

      if (!this.hasPassword) {
        return (<Page><CreatePasswordFragment onComplete={this.skipPasswordStep}/></Page>);
      }
    }

    if (!this.commonStore.isInit) {
      return <Loader/>;
    }

    return React.Children.only(this.props.children);
  }

  @action
  private changeAuthMethod = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    this.authMethod = this.authMethod === 'phone' ? 'email' : 'phone';
  }

  @action
  private skipPasswordStep = () => {
    this.hasPassword = true;
  }
}
