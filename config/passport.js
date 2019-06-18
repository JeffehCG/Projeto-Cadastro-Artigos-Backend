//Arquivo que filtra requisições que não vem com o token valido (parar acesso de usuario não autentificados no sistema)
//Caso o usuario ja venha com um token valido, sera permitido o acesso

const {authSecret} = require('../.env') //pegando o codigo de segurança para ler o token(descryptografar)
const passport = require('passport') //dependencia que ira validar o token
const passportJwt = require('passport-jwt') //O token esta sendo criado com o jwt, então para validar ele é precisso de uma dependencia especifica para fazer o mesmo
const {Strategy, ExtractJwt} = passportJwt

module.exports = app => {
    const params = { //Parametros especificos para Strategy
        secretOrKey: authSecret, //secredo para decodificar
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() //Pegando o token
    }

    //Estrategia para aplicar a validação do token
    const strategy = new Strategy(params, (payload, done) => { //payload - dados do token (contendo por exemplo dados do usuario)
        app.db('users')
            .where({id: payload.id}) //pegando user pelo id
            .first()
            .then(user => done(null, user ? {...payload}: false)) //primeiro parametro é o de erro, nesse caso nullo / se user estiver setado (foi achado no banco) retornar o payload, se não ,retorna false (não foi feita a validação)
            .catch(err=> done(err, false))
    })

    passport.use(strategy)//definindo a strategy que sera usada no passport

    return{
        //METODO QUE FARA A AUTENTIFICAÇÃO DO USUARIO, IMPEDINDO QUE REQUISIÇÕES QUE PRECISAM DE UM TOKEN VALIDO, NÃO SEJAM ACESSADAS SEM UMA VALIDAÇÃO
        authenticate: () => passport.authenticate('jwt', {session: false}) //{session: false} sem controle de sessão
    }
}