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
