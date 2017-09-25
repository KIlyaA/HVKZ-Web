import * as React from 'react';
import styled from 'styled-components';

import images from './images.svg';

const Wrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
`;

const UploadLabel = styled.label`
  width: 24px;
  height: 24px;

  margin: auto;
  cursor: pointer;

  background-color: #fff;
  background-size: 24px;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url(${images});
`;

const UploadInput = styled.input`
  width: 0px;
  height: 0px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

interface UploadButtonProps {
  onChange: React.FormEventHandler<HTMLInputElement>;
  disabled?: boolean;
}

export const UploadButton: React.SFC<UploadButtonProps> = ({ onChange, disabled }) => (
  <Wrapper>
    <UploadInput
      type="file"
      accept="image/jpeg, image/png"
      multiple={true}
      id="upload-image-input"
      onChange={onChange}
      disabled={disabled}
    />
    <UploadLabel htmlFor="upload-image-input"/>
  </Wrapper>
);
