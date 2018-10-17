exports.down = knex => knex.schema
  .dropTableIfExists('messages')

exports.up = knex => knex.schema
  .createTable('messages', table => {
    table.increments('id').primary()
    table.string('message')
  })
