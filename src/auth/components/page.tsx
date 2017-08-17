import * as React from 'react';
import styled from 'styled-components';

const Layout = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 15% 30px 24px 30px;
`;

const AppName = styled.h1`
  display: block;
  width: 100%;

  margin: 0;
  margin-bottom: 48px;

  font-weight: 300;
  font-size: 32px;
  line-height: 48px;

  color: #e2bc52;
`;

export const Page: React.SFC = ({ children }) => (
  <Layout>
    <AppName>Худеем Вместе</AppName>
    <div>{children}</div>
  </Layout>
);
