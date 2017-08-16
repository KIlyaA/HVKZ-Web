import { singleton } from '../utils/di';
import nonce from './nonce';
import signature from './signature';

const paramsTemplate = {
  'oauth_signature_method': 'HMAC-SHA1',
  'oauth_consumer_key': 'ijPAEhakeaHGpoHA',
  'oauth_version': '1.0',
  'oauth_token': '7ptIMyj15RvUrdnMi0d3na6qP.dXCPIisFnGf6rv'
};

@singleton(UAPIClient)
export class UAPIClient {

  public async getAccount(email: string) {
    let url = 'http://hvkz.org/uapi/users';
    const params: {[k: string]: string} = { ...paramsTemplate, user: email };

    params.oauth_timestamp = '' + Math.floor(Date.now() / 1000);
    params.oauth_nonce = nonce();
    params.oauth_signature = signature(url, params);

    const keys = Object.keys(params);
    url = url + '?';

    for (let i = 0; i < keys.length; i++) {
      url += keys[i] + '=' + params[keys[i]];
      if (i + 1 !== keys.length) {
        url += '&';
      }
    }

    const response = await fetch(url);
    const status = await response.status;
    const json = await response.json();

    if (status === 401) {
      throw new Error('Нет соединения с сервером');
    }

    const user = json.users[0];

    if (!user) {
      throw new Error('Аккаунт пользователя с таким email не найден');
    }

    return {
      id: user.uid as string,
      phoneNumber: user.phone as string,
      email: user.email as string
    };
  }

  public async getProfile(id: number) {
    const response = await fetch(`http://hvkz.org/index/8-${id}?api`);
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