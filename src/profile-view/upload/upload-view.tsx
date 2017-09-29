import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';

import { FileUploadTask } from '../../domain/file-upload-task';
import progress from './progress.svg';

interface UploadViewProps {
  task: FileUploadTask;
  className?: string;
}

@observer
class UploadView extends React.Component<UploadViewProps> {

  @observable
  private image: string;  

  public componentWillMount() {
    const fileReader = new FileReader();

    fileReader.onload = action(() => {
      this.image = fileReader.result;
    });

    fileReader.readAsDataURL(this.props.task.file);
  }

  public render(): JSX.Element | null {
    const { className, task } = this.props;
    return (
      <div className={className}>
        {!task.isLoaded && <div className="progress">
          <img src={progress} alt=""/>
        </div>}
        {!!this.image && 
          <div className="image" style={{ backgroundImage: `url(${this.image})` }}/>}
      </div>
    );
  }
}

const StyledUploadView = styled(UploadView)`
  position: relative;

  .progress {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: rgba(0, 0, 0, 0.85);
    z-index: 2;

    display: flex;
    justify-content: center;
    align-items: center;

    > img {
      width: 32px;
      height: 32px;
    }
  }

  .image {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }
`;

export { StyledUploadView as UploadView };
