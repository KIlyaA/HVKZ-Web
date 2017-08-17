import ReactInputMask from 'react-input-mask';
import styled, { css } from 'styled-components';

const inputStyles = css`
  width: 100%;
  box-sizing: border-box;

  margin: 0;
  padding: 0 16px;

  color: #555;
  border: none;
  outline: none;

  border-left: 2px solid #555;

  font-size: 18px;
  line-height: 36px;

  transition: all 250ms ease; 

  &:focus {
    border-left-color: #e6b73f;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover, 
  &:-webkit-autofill:focus
  &:-webkit-autofil {
    -webkit-box-shadow: inset 0 0 0 100px #fff;
    -webkit-text-fill-color: #000;
  }
`;

export const Input = styled.input`
  ${inputStyles};
`;

export const MaskedInput = styled(ReactInputMask)`
  ${inputStyles};
`;
