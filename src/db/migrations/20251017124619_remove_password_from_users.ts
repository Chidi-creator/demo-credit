import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Remove password column if it exists
    table.dropColumn("password");
  });
  
  // Ensure is_verified column exists
  const hasIsVerified = await knex.schema.hasColumn("users", "is_verified");
  if (!hasIsVerified) {
    await knex.schema.alterTable("users", (table) => {
      table.boolean("is_verified").notNullable().defaultTo(false);
    });
  }
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Add password column back
    table.string("password").nullable();
  });
}

