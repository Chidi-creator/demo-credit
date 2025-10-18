import { BaseEntity } from "./base";

export interface IUser extends BaseEntity {
  email: string;
  first_name?: string;
  last_name?: string;
  is_verified?: boolean;
  user_bvn?: string | null;
  is_blacklisted?: boolean;
  deleted_at?: Date | null;
}
