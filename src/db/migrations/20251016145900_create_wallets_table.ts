import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("wallets", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("account_number").notNullable().unique();
    table.decimal("balance", 15, 2).notNullable().defaultTo(0.0);
    table
      .enu("status", ["active", "inactive", "suspended"])
      .notNullable()
      .defaultTo("active");
    table.timestamp("deleted_at").nullable().defaultTo(null);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("wallets");
}
