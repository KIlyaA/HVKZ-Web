import * as React from 'react';
import styled, { keyframes } from 'styled-components';

const blink = keyframes`
  50% {
    opacity: 1
  }
`;

const TypingIndicator: React.SFC<{ className?: string }> = ({ className }) => (
  <div className={className}>
    <span />
    <span />
    <span />
  </div>
);

const StyledTypingIndicator = styled(TypingIndicator)`
  text-align: center;
  
  > span {
    height: 5px;
    width: 5px;
    margin: 0 2px;
    background-color: #9e9ea1;
    display: inline-block;
    border-radius: 50%;
    opacity: 0.4;

    &:nth-child(1) {
      animation: 1s ${blink} infinite 0.3333s;
    }

    &:nth-child(2) {
      animation: 1s ${blink} infinite 0.6666s;
    }

    &:nth-child(3) {
      animation: 1s ${blink} infinite 0.9999s;
    }
  }
`;

export { StyledTypingIndicator as TypingIndicator };
