//Modulo de autentificação do usuario

const {authSecret} = require('../.env') //pegando o codigo de segurança para gerar o token
const jwt = require('jwt-simple') //dependencia para gerar o token
const bcrypt = require('bcrypt-nodejs') //necessario para comparar a senha digitada, com a do bando de dados

module.exports = app => {

    //METODO PARA EFETUAR O LOGIN
    const signin = async (req, res) => {
        //Validações
        if(!req.body.email || !req.body.password){ //validando campos / se forem vazios retornar erro
            return res.status(400).send('Informe usuario e senha')
        }
        
        const user = await app.db('users')
            .where({email: req.body.email})
            .first() 
        if(!user) return res.status(400).send('Usuario não encontrado') //Se email não for encontrado retornar erro

        if(user.deletedAt) return res.status(400).send('Usuario marcado como excluido') //Verificando se o usuario esta marcado como excluido

        const isMatch = bcrypt.compareSync(req.body.password, user.password) //compareSync()- Compara a senha digitada com a criptografada no banco 
        if (!isMatch) return res.status(401).send('Email/senha invalidos') //se não forem iguais retornar erro

        //Gerando token
        const now = Math.floor(Date.now() /1000) //Pegando a data da geração do token em segundos (Data atual)

        const payload = { //Conteudo do token
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            iat: now, //Data de geração do token
            exp: now + (60 * 60 * 24 * 3)//Data de expiração do token (3 dias de validade)
            // exp: now + 10 //10 segundos
        }

        res.json({ //enviando a resposta
            ...payload,
            token: jwt.encode(payload, authSecret) //Gerando o token
        })
    }

    //METODO PARA VALIDAR O TOKEN
    const validateToken = async (req, res) => {
        const userData = req.body || null
        try {
            if(userData){
                const token = jwt.decode(userData.token, authSecret) //Decodificando o token para ver se é valido
                if(new Date(token.exp * 1000 > new Date())){ //Se a data de expiração do token for maior que a tada atual 
                    return res.send(true) //token ainda é valido /nessa linha, se quiser , pode enviar um novo token para o usuario caso estaja perto de vencer
                }
            }
        } catch (error) {
            //problema com o token
        }

        res.send(false) //se não for valido, retorna false
    }

    return {signin, validateToken}
}

