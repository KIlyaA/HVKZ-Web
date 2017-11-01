import * as React from 'react';
import styled from 'styled-components';

const Field = styled.div`
  background: #f8f8f8;
  box-sizing: border-box;
  padding: 8px 15px;
  border-bottom: 1px solid #f5f5f5;  
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  line-height: 20px;
  padding: 0 15px;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;

  margin: 0;
  padding: 0 15px;

  border: none;
  outline: none;

  font-size: 16px;
  line-height: 32px;

  color: #555;  
  background-color: transparent;
`;

interface Props {
  value: string;
  onChange: React.FormEventHandler<HTMLInputElement>;
}

export const NoticeInput: React.SFC<Props> = ({ value, onChange }) => (
  <Field>
    <Label>Сообщение для группы</Label>
    <Input
      value={value}
      onChange={onChange}
      maxLength={100}
      placeholder="Введите сообщение для группы"
    />
  </Field>
);
