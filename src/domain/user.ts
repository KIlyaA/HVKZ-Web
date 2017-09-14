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

export const UnknownUser: User = {
  uid: 0,
  name: 'Неизвестный',
  user: 'unknown',
  phone: '+00000000000',
  email: 'unknown@who.is',
  photo: '',

  regdate: '',
  programStartDate: '',
  promo: false,
  group: {
    id: 999,
    name: 'unknowns'
  },

  city: '',
  country: '',

  age: 0,
  birthday: '',
  gender: 'Неизсветсно',

  signature: '',

  parameters: {
    chest: '',
    underchest: '',
    weight: '',
    growth: '',
    desiredWeight: '',
    waistCirc: '',
    girthPelvis: '',
    girthButtocks: '',
    hipCirc: ''
  }
};
