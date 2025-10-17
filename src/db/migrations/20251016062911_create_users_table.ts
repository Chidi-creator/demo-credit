import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("users", (table) =>{
        table.increments("id").primary();
        table.string("email").notNullable().unique();
        table.string("first_name").nullable();
        table.string("last_name").nullable();
        table.boolean("is_verified").notNullable().defaultTo(false);
        table.timestamp("deleted_at").nullable().defaultTo(null);
        table.timestamps(true, true);
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("users");
}

