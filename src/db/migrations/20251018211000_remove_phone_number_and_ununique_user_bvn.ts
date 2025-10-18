import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop phone_number column if it exists
  const hasPhone = await knex.schema.hasColumn('users', 'phone_number');
  if (hasPhone) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('phone_number');
    });
  }

  // Remove any unique indexes on user_bvn
  const [indexes]: any = await knex.raw(
    `SELECT INDEX_NAME, NON_UNIQUE FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'user_bvn'`
  );

  if (indexes && indexes.length) {
    for (const idx of indexes) {
      if (idx.NON_UNIQUE === 0) {
        const indexName = idx.INDEX_NAME;
        try {
          await knex.schema.alterTable('users', (table) => {
            table.dropIndex([], indexName as string);
          });
        } catch (err) {
          await knex.raw(`ALTER TABLE \`users\` DROP INDEX \`${indexName}\``);
        }
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  // Recreate phone_number column as nullable unique with default null
  const hasPhone = await knex.schema.hasColumn('users', 'phone_number');
  if (!hasPhone) {
    await knex.schema.alterTable('users', (table) => {
      table.string('phone_number').nullable().unique().defaultTo(null);
    });
  }

  // Recreate unique index on user_bvn if desired - we won't recreate it automatically
}
