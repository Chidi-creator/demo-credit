import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    // Remove password column if it exists
    table.dropColumn("password");
    
    // Add is_verified column if it doesn't exist
    // Using raw SQL to handle "IF NOT EXISTS" logic
  });
  
  // Check if is_verified column exists, if not add it
  const hasIsVerified = await knex.schema.hasColumn("users", "is_verified");
  if (!hasIsVerified) {
    await knex.schema.alterTable("users", (table) => {
      table.boolean("is_verified").notNullable().defaultTo(false);
    });
  }
}


export async function down(knex: Knex): Promise<void> {
  // Check if password column exists before adding it back
  const hasPassword = await knex.schema.hasColumn("users", "password");
  if (!hasPassword) {
    await knex.schema.alterTable("users", (table) => {
      table.string("password").nullable();
    });
  }
  
  // Remove is_verified column if it exists
  const hasIsVerified = await knex.schema.hasColumn("users", "is_verified");
  if (hasIsVerified) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("is_verified");
    });
  }
}

