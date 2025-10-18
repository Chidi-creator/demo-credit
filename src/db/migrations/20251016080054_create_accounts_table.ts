import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("accounts", (table) => {
    table.increments("id").primary();

    //foreign keys
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("bank_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("banks")
      .onDelete("CASCADE");

    //account details
    table.string("account_number").notNullable().unique();
    table.string("account_name").notNullable();
    table.string("bank_code").notNullable().unique();
    table.string("bank_name").notNullable();

    table.timestamp("deleted_at").nullable().defaultTo(null);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("accounts");
}
