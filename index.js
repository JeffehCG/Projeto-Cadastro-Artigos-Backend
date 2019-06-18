//consign -- ajuda a trabalhar com as dependencias (importações e exportações)
//nos arquivos do projeto, em vez de fazer um require em todas dependencias, como por exemplo a de baixo (const app = require('express')())
//todas exportações ficam dentro de app , então como exemplo , pra voce acesar um metodo do arquivo user.js da pasta api , acessara direto de app
//usualizando o caminho (app.api.user.save) para pegar chamar o metodo save

const app = require('express')()
const consign = require('consign')
const db = require('./config/db') //importando arquivo de conexão com banco
const mongoose = require('mongoose')//dependencia para se conectar com o MongoDB

require('./config/mongodb')

app.db = db //colocando o db dentro de app
app.mongoose = mongoose

consign()
    .include('./config/passport.js') //Metodo de autentificação, para ser acessado a partir das rotas
    .then('./config/middlewares.js') //Fazendo que o consign carrege os middlewares
    .then('./api/validation.js')
    .then('./api') //Fazendo que o consig carrege todos os arquivos da pasta
    .then('./schedule')
    .then('./config/routes.js')
    .into(app) //envia o app ('express') como parametro, assim carregando as dependencias

app.listen(3002, () => {
    console.log('Backend executando...')
})