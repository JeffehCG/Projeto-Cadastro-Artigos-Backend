//Arquivo de conexão com mongodb

const mongoose = require('mongoose') //conexão com mongo

mongoose.connect('mongodb://localhost/knowledge_statss', {useNewUrlParser: true}) //colocando o lugar que o banco esta //se não tiver esse banco, sera criado
    .catch(e => { //se o banco não conectar cai no catch
        const msg = 'Não foi possivel conectar com o MongoDB'
        console.log('\x1b[41m%s\x1b[37m', msg, '\x1b[0m') //deixando a mensagem em vermelho no terminal 
    })