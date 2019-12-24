import knex from 'knex'
import config from '../knexfile'

const { NODE_ENV } = process.env

export default knex(config[NODE_ENV])
