export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface Address {
  id: number;
  name: string;
  description?: string;
  lat: number;
  lng: number;
}
