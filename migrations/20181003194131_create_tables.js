exports.down = knex => knex.schema
  .dropTableIfExists('blobs')

exports.up = knex => knex.schema
  .createTable('blobs', table => {
    table.increments('id').primary()
    table.string('body')
    table.string('title')
    table.timestamps(true, true)
  })
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_blobs_updated_at
    BEFORE UPDATE ON blobs
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
  `))
