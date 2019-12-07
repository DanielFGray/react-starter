exports.down = knex => knex.schema
  .dropTableIfExists('blobs')

exports.up = knex => knex.schema
  .createTable('blobs', table => {
    table.increments('id').primary()
    table.string('blob')
    table.string('owner')
    table.timestamps(true, true)
  })
