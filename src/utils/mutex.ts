export class Mutex {
  
  private locking: Promise<{}> = Promise.resolve({});
  private locked: boolean = false;
  
  public get isLocked() {
    return this.locked;
  }
  
  // tslint:disable-next-line:no-any
  public lock(): Promise<any> {
    this.locked = true;
    let unlockNext;
    
    let willLock = new Promise(resolve => unlockNext = resolve);
    willLock.then(() => this.locked = false);

    let willUnlock = this.locking.then(() => unlockNext);
    this.locking = this.locking.then(() => willLock);

    return willUnlock;
  }
}
