declare module "react-siema" {

  import { Component } from 'react';

  export interface SiemaSliderProps {
    resizeDebounce?: number;
    duration?: number;
    easing?: string;
    perPage?: number;
    startIndex?: number;
    draggable?: boolean;
    threshold?: number;
    loop?: boolean;

    onChange?(something: any): void;
  }

  export default class SiemaSlider extends Component<SiemaSliderProps> {

    public readonly currentSlide: number;

    public next(): void;
    public prev(): void;
    public goTo(index: number): void;
  } 
}
