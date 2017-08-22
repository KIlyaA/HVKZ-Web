import styled from 'styled-components';

import { Lead } from './lead';
import { Title } from './title';
import { Input, MaskedInput } from './input';
import { Action } from './action';

export const Form = styled.form`
  margin-bottom: 24px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  & > ${Title} {
    margin-bottom: 36px;
  }

  & > ${Lead},
  & > ${Input},
  & > ${MaskedInput} {
    margin-bottom: 24px;
  }

  & > ${Action} {
    margin-left: 10px;
  }
`;
