export type UserMode = "travelling" | "shopping";

export interface User {
  id: number;
  name: string;
  initials: string;
  mode: UserMode;
}

export interface Trip {
  id: number;
  traveler: User;
  fromCountry: string;
  toCountry: string;
  fromFlag: string;
  toFlag: string;
  route: string;
  date: string;
  capacity: string;
}
