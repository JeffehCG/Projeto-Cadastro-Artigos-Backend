//body-parser -- interpreta o body da requisição 
//cors -- permitir que outra aplicação acese a API do backende (no caso o frontend acessa essa API)

const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = app => { //retornando uma função, devera ser passado o parametro app(representa a instancia do express)
    app.use(bodyParser.json())
    app.use(cors())
}

