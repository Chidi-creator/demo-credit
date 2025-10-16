import { BaseEntity } from "./base";

export interface IUser extends BaseEntity {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  deleted_at?: Date | null;
}
