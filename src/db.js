import knex from 'knex'

const config = require('../knexfile')
const env = process.env.NODE_ENV

export default knex(config[env])
