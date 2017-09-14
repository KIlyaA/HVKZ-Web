import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as React from 'react';
import styled from 'styled-components';

import { FileUploadTask } from '../domain/file-upload-task';
import { Progress } from './progress';

interface UploadViewProps {
  task: FileUploadTask;

  onCancel: (task: FileUploadTask) => void;
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
      <div className={className} onClick={this.handleCancel}>
        {!task.isLoaded && <div className="progress"><Progress progress={task.progress} /></div>}
        {!!this.image && <img src={this.image} alt="" />}
      </div>
    );
  }

  private handleCancel = () => {
    if (confirm('Отменить загрузку фотографии?')) {
      this.props.onCancel(this.props.task);
    }
  }
}

const StyledUploadView = styled(UploadView)`
  position: relative;
  width: 64px;
  height: 64px;

  cursor: pointer;

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
  }

  img {
    width: 100%;
    height: 100%;
  }
`;

export { StyledUploadView as UploadView };
