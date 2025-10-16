import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable("transactions", (table) =>{
        table.increments("id").primary();
        table.integer("wallet_id").unsigned().notNullable()
            .references("id").inTable("wallets")
            .onDelete("CASCADE");
        table.enu("type", ["fund", "withdraw", "transfer", "reversal"]).notNullable();
        table.string("reference").notNullable().unique();
        table.decimal("amount", 15, 2).notNullable();
        table.string("currency").notNullable().defaultTo("NGN");
        table.enu("direction", ["credit", "debit"]).notNullable();
        table.enu("status", ["pending", "completed", "failed"]).notNullable();
        table.string("description").nullable();
        table.json("metadata").nullable();
        table.string("external_reference").nullable();
        table.timestamps(true, true);
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists("transactions");
}

