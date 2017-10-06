import { Strophe } from 'strophe.js';

import { singleton } from './utils/di';
import { User } from './domain/models';

const baseUrl = '//api.hvkz.org:9090/plugins/restapi/v1/';
const openfireHeaders = {
  'Accept': 'application/json',
  'Authorization': 'xp2rmBRtww9B2N5h',
  'Content-Type': 'application/json'
};

@singleton(APIClient)
export class APIClient {

  public async getUser(email: string): Promise<User | null> {
    const username = email.replace(/@|\./g, '').replace('-', '~');

    // TODO: Delete proxy request
    const response = await fetch(`//hvkz.org/index/8-0-${username}?api`);
    // const response = 
    // await fetch(`https://cors-anywhere.herokuapp.com/http://hvkz.org/index/8-0-${username}?api`, { headers: {
    //   'Origin': 'hvkz.org',
    //   'X-Requested-With': 'XMLHttpRequest'
    // }});
    
    const body = await response.text();

    const start = body.indexOf('START') + 5;
    const end = body.indexOf('END');

    if (start === -1 || end === -1) {
      return null;
    }

    const json = JSON.parse(body.substring(start, end).replace(':,', ':"",'));
    return json;
  }

  public async getRoster(userId: string): Promise<number[]> {
    const url = `${baseUrl}users/${userId}/roster`;
    const response = await fetch(url, { method: 'GET', headers: openfireHeaders });
    const status = await response.status;
    const roster = (await response.json()).rosterItem || [];

    if (status === 200) {
      if (roster.push) {
        const ids: number[] = [];
        roster.forEach((record: { jid: string }) => {
          console.log(Strophe.getNodeFromJid(record.jid), Number(Strophe.getNodeFromJid(record.jid)));
          ids.push(Number(Strophe.getNodeFromJid(record.jid)));
        });

        return ids;
      }
      
      return [Number(Strophe.getNodeFromJid(roster.jid))];
    }

    return [];
  }
  
  public async createChatAccount(userId: number, password: string): Promise<boolean> {
    const body = JSON.stringify({ username: userId, password });

    const response = await fetch(baseUrl + 'users', { 
      method: 'POST', 
      headers: openfireHeaders, 
      body 
    });

    // created or conflict
    return response.status === 201 || response.status === 409;
  }

  public async createChatRoom(roomName: string, notice: string): Promise<void> {
    const body = JSON.stringify({
      roomName,
      naturalName: roomName,
      description: notice,
      loginRestrictedToNickname: 'true',
      persistent: 'true',
      publicRoom: 'true',
      membersOnly: 'false',
      logEnabled: 'true', 
      registrationEnabled: 'true',
      canAnyoneDiscoverJID: 'true',
    });
    
    const response = await fetch(baseUrl + 'users', { 
      method: 'POST', 
      headers: openfireHeaders, 
      body 
    });

    if (response.status !== 201) {
      throw new Error('Не удалось создать чат-комнату');
    }
  }
}
