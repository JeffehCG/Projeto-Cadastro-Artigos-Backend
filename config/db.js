//Arquivo de conexão com banco

const config = require('../knexfile.js') //importando o arquivo de configuração do banco
const knex = require('knex')(config) //instanciando o knex, e passando o arquivo de configuração

knex.migrate.latest([config]) //Quando backend for startado, executar as migrates automaticamente (arquivos que criam as tabelas no banco)

module.exports = knex 