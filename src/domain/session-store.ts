import { auth as Auth, User as Session } from 'firebase';
import { action, observable, runInAction, when, computed } from 'mobx';

import { UAPIClient } from '../uapi';
import { inject, singleton } from '../utils/di';

interface UserInfo {
  id?: number;
  email?: string;
  phoneNumber: string;
  isNew: boolean;
}

@singleton(SessionStore)
export class SessionStore {

  @observable
  public isReady: boolean = false;

  @observable
  public requestCodeTimeout: number = 0;

  @observable
  private userInfo: UserInfo;

  @observable.ref
  private session: Session;

  @observable.ref
  private confirmation?: Auth.ConfirmationResult;

  private intervalHandler: number;

  @inject(Auth)
  private authService: Auth.Auth;

  @inject(UAPIClient)
  private uAPIClient: UAPIClient;

  @computed
  public get codeSent(): boolean {
    return this.confirmation != null;
  }

  @computed
  public get isAuthenticated(): boolean {
    return this.session != null;
  }

  @computed
  public get hasProfile(): boolean {
    return this.userInfo.id != null;
  }

  @computed
  public get hasCredential(): boolean {
    return this.userInfo.email != null && !this.userInfo.isNew;
  }

  public constructor() {
    const unsubscribe = this.authService.onAuthStateChanged(session => {
      this.isReady = true;
      
      if (session != null && session.email != null) {
        this.setSession(session);
      }
      
      unsubscribe();
    });
  }

  public async sendCode(phoneNumber: string, verifier: Auth.ApplicationVerifier): Promise<void> {
    if (this.requestCodeTimeout > 0) {
      return;
    }

    try {
      const result: Auth.ConfirmationResult =
        await this.authService.signInWithPhoneNumber(phoneNumber, verifier);

      runInAction(() => {
        this.confirmation = result;
        this.requestCodeTimeout = 60;
        this.intervalHandler = setInterval(this.tick, 1000);
      });
    } catch (e) {
      switch (e) {
        case 'auth/captcha-check-failed':
          throw new Error('Необходимо пройти проверку');
        case 'auth/quota-exceeded':
          throw new Error('Отправка кода временно не возможна');
        case 'auth/missing-phone-number':
        case 'auth/invalid-phone-number':
          throw new Error('Некорректный формат номера телефона');
        default:
          throw new Error('Неизвестная ошибка');
      }
    }
  }

  public async signInWithCode(verificationCode: string): Promise<void> {
    if (this.confirmation == null) {
      return Promise.reject(void 0);
    }

    try {
      const session: Session = (await this.confirmation.confirm(verificationCode)).user!;
      runInAction(() => {
        this.requestCodeTimeout = 0;
        this.confirmation = void 0;
        clearInterval(this.intervalHandler);
        this.setSession(session);
      });
    } catch (e) {
      throw new Error('Неверный код подтверждения');
    }
  }

  public async signInWithEmail(email: string, password: string): Promise<void> {
    try {
      const session: Session = await this.authService.signInWithEmailAndPassword(email, password);
      this.setSession(session);
    } catch (e) {
      throw new Error('Неверный email или пароль');
    }
  }

  public async bindProfile(email: string): Promise<void> {
    const account = await this.uAPIClient.getAccount(email);

    const accountPhone = account.phoneNumber.replace(/s+/g, '').slice(-10);
    const userPhone = this.userInfo.phoneNumber.replace(/s+/g, '').slice(-10);

    if (accountPhone !== userPhone) {
      throw new Error('Ваш номер телефона не совпадает с номером, указанным в анкете');
    }

    try {
      await this.session.updateProfile({ displayName: account.id, photoURL: '' });
      runInAction(() => {
        this.userInfo.id = Number(account.id);
        this.userInfo.email = account.email;
      });
    } catch (error) {
      throw new Error('Неизвестная ошибка');
    }
  }

  public async createOrUpdatePassword(password: string): Promise<void> {
    if (password.length < 5) {
      throw new Error('Минимальная длина пароля 5 символов');
    }

    const email = this.userInfo.email;

    if (email == null) {
      throw new Error('Необходимо привязать анкету');
    }

    try {
      await this.session.updatePassword(password);
      await this.session.updateEmail(email);
      await this.session.reauthenticateWithCredential(
        Auth.EmailAuthProvider.credential(email, password));

      runInAction(() => {
        this.userInfo.isNew = false;
      });
    } catch (e) {
      throw new Error('Не удалось установить пароль');
    }
  }

  @action.bound
  private tick(): void {
    if (this.requestCodeTimeout > 0) {
      this.requestCodeTimeout--;
    } else {
      clearInterval(this.intervalHandler);
    }
  }

  private setSession(session: Session): void {
    this.userInfo = {
      id: Number(session.displayName) || void 0,
      email: session.email || void 0,
      phoneNumber: session.phoneNumber!,
      isNew: session.displayName == null || session.email == null
    };

    this.session = session;
    when(() => !this.userInfo.isNew, async () => {
      const profile = await this.uAPIClient.getProfile(this.userInfo.id!);
      console.debug(profile);
    });
  }
}
