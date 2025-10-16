export interface IUser {
    id?: number;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    deleted_at?: Date | null;
    created_at: Date;
    updated_at: Date;
}