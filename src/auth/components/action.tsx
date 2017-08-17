import styled from 'styled-components';

export const Action = styled.a`
  font-size: 16px;
  font-weight: normal;

  cursor: pointer;
  transition: all 250ms ease-in-out;
  text-decoration: none;

  color: #e6b73f;

  &:hover,
  &:active {
    text-decoration: underline;
  }
`;
