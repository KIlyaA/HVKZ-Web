import * as React from 'react';
import { action } from 'mobx';
import styled from 'styled-components';

import { inject } from '../utils/di';
import { UIStore } from '../domain/ui-store';
import { Photo } from '../domain/models';

interface Props {
  items: Photo[];
  onAdditionalClick: (index: number) => void;
  className?: string;
}

class Gallery extends React.Component<Props> {

  @inject(UIStore)
  private uiStore: UIStore;

  @action
  public componentDidMount(): void {
    this.uiStore.currentImages = this.props.items;
    this.uiStore.indexImage = 0;
  }

  public componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.items !== this.props.items) {
      this.uiStore.currentImages = this.props.items;
      this.uiStore.indexImage = 0;
    }
  }

  @action
  public componentWillUnmount(): void {
    this.uiStore.currentImages = [];
    this.uiStore.indexImage = 0;
  }

  public render(): JSX.Element {
    return (
      <div className={this.props.className}>
        {this.props.items.map((photo, index) => (
          <div
            className="thumbnail" 
            onClick={this.handleClick}
            onContextMenu={this.handleContextMenu}
            key={photo.url}
            data-index={index}
          >
            <div className="image" style={{ backgroundImage: `url(${photo.url})` }}/>
          </div>
        ))}
      </div>
    );
  }

  @action
  private handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const index = event.currentTarget.getAttribute('data-index');

    if (index) {
      this.uiStore.indexImage = Number(index);    
      this.uiStore.isOpenGallery = true;
    }
  }

  private handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const index = event.currentTarget.getAttribute('data-index');

    if (index) {
      this.props.onAdditionalClick(Number(index));
    }
  }
}

const StyledGallery = styled(Gallery)`
  display: flex;
  flex-flow: row wrap;
  width: 100%;

  .thumbnail {
    position: relative;
    width: 33.3333%;
    box-sizing: border-box;    
    border-right: 2px solid #fff;
    border-bottom: 2px solid #fff;

    &:before {
      display: block;
      content: "";
      width: 100%;      
      padding-top: 100%;
    }

    &:nth-child(3n) {
      border-right: none;
    }

    > .image {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;

      background-size: cover;
      background-position: center;
    }
  }
`;

export { StyledGallery as Gallery };
