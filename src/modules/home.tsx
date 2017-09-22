import { inject } from '../utils/di';
import * as React from 'react';

import { CommonStore } from '../domain/common-store';

import { ProfileView } from '../profile-view';
import { Layout } from './components/layout';

export class Home extends React.PureComponent {

  @inject(CommonStore)
  private commonStore: CommonStore;

  public render(): JSX.Element | null {
    return (
      <Layout>
        <ProfileView userId={this.commonStore.currentUserId} />
      </Layout>
    );
  }
}
