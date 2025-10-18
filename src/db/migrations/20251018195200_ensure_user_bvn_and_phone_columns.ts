import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const hasUserBvn = await knex.schema.hasColumn("users", "user_bvn");
  if (!hasUserBvn) {
    await knex.schema.alterTable("users", (table) => {
      table.string("user_bvn", 11).nullable().unique().defaultTo(null);
    });
  }

  const hasPhone = await knex.schema.hasColumn("users", "phone_number");
  if (!hasPhone) {
    await knex.schema.alterTable("users", (table) => {
      table.string("phone_number", 20).nullable().unique().defaultTo(null);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasPhone = await knex.schema.hasColumn("users", "phone_number");
  if (hasPhone) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("phone_number");
    });
  }

  const hasUserBvn = await knex.schema.hasColumn("users", "user_bvn");
  if (hasUserBvn) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("user_bvn");
    });
  }
}
