import { Strophe } from 'strophe.js';

import { singleton } from '../../utils/di';
import { Chat } from '../chat';

@singleton(XMPPReceiver)
export class XMPPReceiver {

  private chats: Map<string, Chat> = new Map();

  public registerChat(chat: Chat) {
    this.chats.set(chat.id, chat);
  }

  public unregisterChat(chat: Chat) {
    this.chats.delete(chat.id);
  }

  public onMessageReceive = (message: Element): boolean => {
    try {
      const child = message.children[0];
      const from = message.getAttribute('from')!;

      const childName = child.tagName.toLowerCase();
      const chatId = Strophe.getNodeFromJid(from);

      const chat = this.chats.get(chatId);

      if (chat === void 0) {
        // call special method
        return true;
      }

      switch (childName) {
        case 'body': {
          chat.onMessageReceive(child.innerHTML);
          break;
        }

        case 'active':
        case 'inactive':
        case 'composing': {
          const type = message.getAttribute('type')!;
          const senderId = Number.parseInt(
            type === 'chat' ? Strophe.getNodeFromJid(from) : from.split('/').pop()!);
          const name = childName;

          chat.onStatusChanged(name, senderId);
          break;
        }

        default: break;
      }
    } catch (e) {
      console.log(e);
    }

    return true;
  }
}
