// Base interface that all your models will extend
export interface BaseEntity {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}