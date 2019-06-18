// Update with your config settings.
//Configurações da conexão com o o banco de dados

const {db} = require('./.env') //Importando o arquivo contendo as configurações do banco

module.exports = {
    client: 'postgresql',
    connection: db,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
};

//vem como padrão o postgresslq
//para utilizar com outro banco é preciso baixar o client desse outro banco
//por exemplo, se for mysql , tem que baixar o client no node-modules