import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("banks", (table) => {
    // Primary key
    table.increments("id").primary();

    // Bank details
    table.string("bank_name").notNullable();
    table.string("bank_code").notNullable().unique();

    // Timestamps
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("banks");
}
