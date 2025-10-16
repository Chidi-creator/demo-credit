import { BaseEntity } from './base';

export interface IBank extends BaseEntity {
    bank_name: string;
    bank_code: string;
}