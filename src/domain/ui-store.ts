import { observable } from 'mobx';

import { singleton } from '../utils/di';
import { Message, Photo } from './models';

@singleton(UIStore)
export class UIStore {

  @observable
  public currentSlide: number = 0;

  @observable.shallow
  public selectedMessages: Map<string, Message> = new Map();

  @observable.shallow
  public currentImages: Photo[] = [];

  @observable
  public isOpenGallery: boolean = false;

  @observable
  public indexImage: number = 0;
}
