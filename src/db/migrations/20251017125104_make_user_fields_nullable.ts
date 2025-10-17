import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Make first_name and last_name nullable (they might not be provided during OTP signup)
    table.string("first_name").nullable().alter();
    table.string("last_name").nullable().alter();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Revert back to not nullable (be careful - this might fail if there are null values)
    table.string("first_name").notNullable().alter();
    table.string("last_name").notNullable().alter();
  });
}

