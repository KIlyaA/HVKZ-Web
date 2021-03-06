import * as React from 'react';
import styled from 'styled-components';

import { BottomBar } from './bottom-bar';

const LayoutStructure: React.SFC<{className?: string}> = (props) => (
  <div className={props.className}>
    <div className="viewport">
      {props.children}
    </div>
    <BottomBar/>
  </div>
);

export const Layout = styled(LayoutStructure)`
  width: 100%;
  height: 100%;

  display: flex;
  flex-flow: column nowrap;

  overflow: hidden;

  .viewport {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }
`;
