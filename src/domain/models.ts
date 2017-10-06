export interface Message {
  body: string;
  images: string[];
  forwarded: FWD[];
  senderId: number;
  recipientId: number;
  timestamp: number;
}

export interface FWD {
  images: string[];
  message: string;
  sender: number;
  timestamp: number;
}

export interface Group {
  name: string;
  admin: number;
  members: number[];
  notice: string;
}

export interface MenuItem {
  bzu: number[];
  dayArray: string[];
}

export interface User {
  uid: number;
  name: string;
  user: string;
  phone: string;
  email: string; 
  photo: string;
  
  regdate: string;
  programStartDate: string;
  promo: boolean;
  group: {
    id: number;
    name: string;
  };

  city: string;
  country: string;
  
  age: number;
  birthday: string; 
  gender: string;
  
  signature: string;

  parameters: {
    chest: string;
    underchest: string;
    weight: string;
    growth: string;
    desiredWeight: string;
    waistCirc: string;
    girthPelvis: string;
    girthButtocks: string;
    hipCirc: string;
  };
}

export interface Photo {
  date?: number;
  description?: string;
  url: string;
}

export type CHAT_STATE = 'active' | 'inactive' | 'composing';
