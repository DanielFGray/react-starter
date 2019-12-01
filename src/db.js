import knex from 'knex'
import config from '../knexfile'

const env = process.env.NODE_ENV

export default knex(config[env])
