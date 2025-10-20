import db from "@db/mysql";
import { BaseEntity } from "@models/base";
import { DatabaseError } from "@managers/error.manager";

export abstract class BaseRepository<T extends BaseEntity> {
  protected abstract table: string;

  async create(
    data: Omit<T, "id" | "created_at" | "updated_at">
  ): Promise<number> {
    try {
      const [insertedId] = await db(this.table).insert(data);
      return insertedId;
    } catch (error: any) {
      throw new DatabaseError(`Error creating ${this.table}: ${error.message}`);
    }
  }

  async insertMany(
    data: Omit<T, "id" | "created_at" | "updated_at">[]
  ): Promise<number[]> {
    try {
      const insertedIds = await db(this.table).insert(data);
      return insertedIds;
    } catch (error: any) {
      throw new DatabaseError(`Error inserting many ${this.table}: ${error.message}`);
    }
  }

  async findById(id: number): Promise<T | undefined> {
    try {
      return await db(this.table).where({ id }).first();
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding ${this.table} by id: ${error.message}`
      );
    }
  }

  async findOneByQuery(query: Partial<T>): Promise<T | undefined> {
    try {
      return await db(this.table).where(query).first();
    } catch (error: any) {
      throw new DatabaseError(
        `Error finding ${this.table} by query: ${error.message}`
      );
    }
  }

  async findAll(limit?: number, offset?: number): Promise<T[]> {
    try {
      let query = db(this.table).select("*");
      if (typeof limit === "number") {
        query = query.limit(limit).offset(offset || 0);
      }
      return await query;
    } catch (error: any) {
      throw new DatabaseError(
        `Error fetching all ${this.table}: ${error.message}`
      );
    }
  }

  async  update(
    id: number,
    data: Partial<Omit<T, "id" | "created_at" | "updated_at">>
  ): Promise<boolean> {
    try {
      const updatedRows = await db(this.table).where("id", id).update(data);
      return updatedRows > 0;
    } catch (error: any) {
      throw new DatabaseError(`Error updating ${this.table}: ${error.message}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const deletedRows = await db(this.table).where("id", id).del();
      return deletedRows > 0;
    } catch (error: any) {
      throw new DatabaseError(`Error deleting ${this.table}: ${error.message}`);
    }
  }

  async findAllByColumn(column: string, value: any): Promise<T[]> {
    try {
      return await db(this.table).where({ [column]: value });
    } catch (error: any) {
      throw new DatabaseError(
        `Error fetching all ${this.table} by column: ${error.message}`
      );
    }
  }


}
