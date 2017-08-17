import styled from 'styled-components';

export const Submit = styled.button`
  padding: 10px 12px;

  color: #555;
  outline: none;
  border: 2px solid #555;
  border-radius: 3px;
  background-color: transparent;

  font-size: 16px;

  outline: none;  
  cursor: pointer;
  user-select: none;

  transition: all 250ms ease-in-out;

  &:active,
  &:hover {
    box-shadow: 0px 0px 0px 2px #555;
  }
`;
