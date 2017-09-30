import { auth as Auth, User as Session } from 'firebase';
import { action, computed, observable, runInAction, when } from 'mobx';

import { inject, singleton } from '../utils/di';
import { APIClient } from '../api';
import { CommonStore } from './common-store';
import { User } from './models';

@singleton(SessionStore)
export class SessionStore {

  @observable.ref
  public user: User;

  @observable
  public isReady: boolean = false;

  @observable
  public requestCodeTimeout: number = 0;

  @observable.ref
  private session: Session;

  @observable.ref
  private confirmation?: Auth.ConfirmationResult;

  private intervalHandler: number;

  @inject(Auth)
  private authService: Auth.Auth;

  @inject(APIClient)
  private uAPIClient: APIClient;

  @inject(CommonStore)
  private commonStore: CommonStore;

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
    return this.isAuthenticated && this.user != null;
  }

  @computed
  public get currentUserId(): number | null {
    if (this.user != null) {
      return this.user.uid;
    }

    return null;
  }

  public constructor() {
    const unsubscribe = this.authService.onAuthStateChanged(session => {
      if (session != null && session.email != null) {
        this.setSession(session);
      } else {
        this.isReady = true;
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

  @action
  public async bindProfile(email: string): Promise<void> {
    const user = await this.uAPIClient.getUser(email);

    if (user === null) {
      throw new Error('Анкета пользователя не найдена');
    }

    const userPhone = user.phone.replace(/s+/g, '').slice(-10);
    const accountPhone = this.session.phoneNumber!.replace(/s+/g, '').slice(-10);

    if (accountPhone !== userPhone) {
      throw new Error('Ваш номер телефона не совпадает с номером, указанным в анкете');
    }

    try {
      await this.session.updateProfile({ displayName: user.uid.toString(), photoURL: '' });
      await this.session.updateEmail(email);

      this.user = user;
    } catch (error) {
      throw new Error('Неизвестная ошибка');
    }
  }

  public async createOrUpdatePassword(password: string): Promise<void> {
    if (password.length < 5) {
      throw new Error('Минимальная длина пароля 5 символов');
    }

    const email = this.user.email;

    if (email == null) {
      throw new Error('Необходимо привязать анкету');
    }

    try {
      await this.session.updatePassword(password);
      await this.session.reauthenticateWithCredential(
        Auth.EmailAuthProvider.credential(email, password));
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

  @action
  private async setSession(session: Session): Promise<void> {
    if (session.email != null) {
      const user = await this.uAPIClient.getUser(session.email);

      if (user != null) {
        this.user = user;
      }
    }

    this.isReady = true;
    this.session = session;

    when(() => this.hasProfile, () => this.commonStore.init(this.user));
  }
}
