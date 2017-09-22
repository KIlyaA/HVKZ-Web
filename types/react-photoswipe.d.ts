declare module "react-photoswipe" {
  import * as React from 'react';

  interface Props {
    items: any[];
    options: any;
    imageLoadComplete?: (instance, index, item) => void;
    gettingData?: (instance, index, item) => void;
    thumbnailContent?: (obj: any) => JSX.Element;
    className?: string;
    isOpen?: boolean;
    onClose?: () => void;
  }

  export class PhotoSwipeGallery extends React.Component<Props> {}
  export class PhotoSwipe extends React.Component<Props> {}
}
