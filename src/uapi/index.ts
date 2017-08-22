import { User } from '../domain/user';
import { singleton } from '../utils/di';

@singleton(UAPIClient)
export class UAPIClient {

  private static HEADERS = {
    'Origin': 'hvkz.org',
    'X-Requested-With': 'XMLHttpRequest'
  };

  public async getUser(email: string): Promise<User | null> {
    const username = email.replace(/@|\./g, '');

    const response = await fetch(
      `https://cors-anywhere.herokuapp.com/http://hvkz.org/index/8-0-${username}?api`,
      { headers: UAPIClient.HEADERS });
    
    const body = await response.text();

    const start = body.indexOf('START') + 5;
    const end = body.indexOf('END');

    if (start === -1 || end === -1) {
      return null;
    }

    const json = JSON.parse(body.substring(start, end).replace(':,', ':"",'));
    return json;
  }
}
