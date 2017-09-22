import PouchDB from 'pouchdb-browser';

import { Message } from '../domain/chat';
import { singleton } from './di';
import { Mutex } from './mutex';

interface Chat {
  unreads: number[];
  messages: Message[];
}

@singleton(HistoryManager)
export class HistoryManager {

  private database: PouchDB.Database<Chat> =
    new PouchDB('HVKZWebApplication', { revs_limit: 1 });
  
  private lastTimestamps: { [k: string]: number } = {};

  private locker: Mutex = new Mutex();

  public async initChat(chatId: string) {
    try {
      try {
        await this.database.put({
          _id: chatId,
          messages: [],
          unreads: []
        });
      } catch (_) { /* ignored */ }

      const chat = await this.database.get(chatId);
      const message = chat.messages[chat.messages.length - 1];
      this.lastTimestamps[chatId] = !!message ? message.timestamp : 0; 
    } catch (e) {
      console.log(e);
    }
  }

  public async getHistory(chatId: string, startWith: number) {
    try {
      const chat = await this.database.get(chatId);
      const messages: Message[] = [];
  
      for (let i = chat.messages.length - 1; i >= 0; i--) {
        if (messages.length >= 30) {
          break;
        }
        
        let message = chat.messages[i];
        if (message.timestamp < startWith) {
          messages.push(chat.messages[i]);
        }
      }

      if (messages.length === 0) {
        return null;
      }

      return messages.reverse();
    } catch (e) {
      console.log(e);
      return [] as Message[];
    }
  }

  public async addMessage(chatId: string, message: Message) {
    try {
      if (this.lastTimestamps[chatId] >= message.timestamp) {
        // console.log('Пропущено:', chatId, message);
        return false;
      }

      const unlock = await this.locker.lock();

      const chat = await this.database.get(chatId);
      chat.messages.push(message);

      await this.database.put({
        _id: chat._id,
        _rev: chat._rev,
        messages: chat.messages,
        unreads: chat.unreads
      });

      this.lastTimestamps[chatId] = message.timestamp;
      unlock();
    } catch (e) {
      console.log(e);
    }

    return true;
  }

  public async clearHistory(chatId: string) {
    try {
      const chat = await this.database.get(chatId);
      await this.database.remove({
        _id: chat._id!,
        _rev: chat._rev!
      });
    } catch (e) {
      console.log(e);
    }
  }
}
