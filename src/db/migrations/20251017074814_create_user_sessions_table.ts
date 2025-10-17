import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Drop table if it exists first
  await knex.schema.dropTableIfExists("user_sessions");
  
  return knex.schema.createTable("user_sessions", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.string("refresh_token").notNullable();
    table.string("token").notNullable();
    table.datetime("expires_at").notNullable();
    table.timestamps(true, true);

    // Foreign key constraint
    table
      .foreign("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    // Index for faster lookups
    table.index(["user_id"]);
    table.index(["refresh_token"]);
    table.index(["expires_at"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("user_sessions");
}
