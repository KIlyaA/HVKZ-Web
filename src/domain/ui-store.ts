import { observable } from 'mobx';
import { singleton } from '../utils/di';

import { Message } from './chat';

@singleton(UIStore)
export class UIStore {

  @observable
  public currentSlide: number = 0;

  @observable.shallow
  public selectedMessages: Map<string, Message> = new Map();

  @observable.shallow
  public currentImages: string[] = [];

  @observable
  public isOpenGallery: boolean = false;

  @observable
  public indexImage: number = 0;
}
