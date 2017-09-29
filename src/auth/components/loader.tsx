import * as React from 'react';
import styled from 'styled-components';

import spinner from './spinner.svg';

const Loader: React.SFC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <img src={spinner} alt="" className="spinner"/>
  </div>
);

const StyledLoader = styled(Loader)`
  width: 100%;
  height: 100%;
  display: flex;

  > .spinner {
    margin: auto;

    width: 64px;
    height: 64px;
    user-select: none;
  }
`;

export { StyledLoader as Loader };
