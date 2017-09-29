import * as React from 'react';
import styled from 'styled-components';

import images from './images.svg';

const UploadLabel = styled.label`
  margin: auto;
  cursor: pointer;

  background-size: 24px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${images});

  width: 56px;
  height: 56px;
  display: flex;

  position: fixed;
  bottom: 15%;
  right: 30px;
  background-color: #e2bc52;
  border-radius: 50%;
  box-shadow: 0 1px 1px 0 rgba(0,0,0,0.10), 
    0 1px 2px 0 rgba(0,0,0,0.12), 0 0px 1px -2px rgba(0,0,0,0.2);
`;

const UploadInput = styled.input`
  width: 0px;
  height: 0px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

interface Props {
  onChange: React.FormEventHandler<HTMLInputElement>;
}

export const UploadButton: React.SFC<Props> = ({ onChange }) => (
  <UploadLabel htmlFor="upload-image-input">
    <UploadInput
      type="file"
      accept="image/jpeg, image/png"
      id="upload-image-input"
      onChange={onChange}
    />
  </UploadLabel>
);
