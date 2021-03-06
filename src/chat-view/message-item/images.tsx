import * as React from 'react';
import styled from 'styled-components';
import { action } from 'mobx';

import { inject } from '../../utils/di';
import { UIStore } from '../../domain/ui-store';

interface ImagesProps {
  urls: string[];
  className?: string;
}

class Images extends React.Component<ImagesProps> {

  @inject(UIStore)
  private uiStore: UIStore;

  public render(): JSX.Element {
    const { className, urls } = this.props;

    return (
      <div className={className}>
        {urls.map((url, index) => (
          <div key={url}>
            <img
              onClick={this.handleClick} 
              src={url.replace('&amp;', '&')}
              data-index={index}
            />
          </div>
        ))}
      </div>
    );
  }

  @action
  private handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    const index = event.currentTarget.getAttribute('data-index');
    console.log(index);

    if (index) {
      this.uiStore.currentImages = this.props.urls.map(url => ({ url }));
      this.uiStore.indexImage = Number(index);    
      this.uiStore.isOpenGallery = true;
    }
  }
}

const StyledImages = styled(Images)`
  margin: 0 -4px;

  > div {
    box-sizing: border-box;
    display: inline-block;
    width: ${p => p.urls.length % 2 === 0 ? '50%' : '100%'};
    padding: 4px;

    > img {
      width: 100%;
      height: auto;
    }
  }
`;

export { StyledImages as Images };
