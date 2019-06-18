const bcrypt = require('bcrypt-nodejs') //Criptorafar senha do usuarios

module.exports = app => {
    const { existsOrError , notExistsOrError, equalsOrError } = app.api.validation //importando funções de validation.js

    //Função para criptografar a senha 
    const encryPassword = password => {
        const salt = bcrypt.genSaltSync(10) //cada vez que for executado, sera gerado um hash diferente (mesmo senhas iguais, teram o hash completamente diferente)
        return bcrypt.hashSync(password, salt) //Gerando o hash da senha
    }

    //METODO PARA INSERIR OU ALTERAR USUARIO
    const save = async (req,res) => { 
        const user = {...req.body} //os dados da requisição seram enviados pelo body em formato JSON (o bodyParser intercepita isso, e transforma em um objetos
        if(req.params.id) user.id = req.params.id //se o id do usuario estiver setado(alteração)

        //validações para verificar se o usuario que esta efetuando o cadastro é admin (apenas um usuario admin pode cadastrar novos admins)
        if(!req.originalUrl.startsWith('/users')) user.admin = false //Verificando se o usuario esta acessando o metodo save pela url '/users' (se não significa que ele não é um admin, e esta acessando pela url 'signup)
        if(!req.user || !req.user.admin) user.admin = false //se user não estiver setado, e se user.admin for false

        //Validações de erros
        try{
            existsOrError(user.name, 'Nome não informado')
            existsOrError(user.email, 'E-mail não informado')
            existsOrError(user.password, 'Senha não informada')
            existsOrError(user.confirmPassword, 'Confirmação de senha invalida')
    
            equalsOrError(user.confirmPassword, user.password, 'Senhas não conferem')

            const userFromDB = await app.db('users') //Acessando tabela do db
                .where({email: user.email}).first() //procurando se o email ja existe
            
            //Se for novo cadastro, e userFromDB for true, significa que o usuario ja foi cadastrado anteriormente (ira dar erro)
            if(!user.id){
                notExistsOrError(userFromDB, 'Usuario já cadastrado')
            }
        }catch(msg){
            return res.status(400).send(msg) //caso alguma validação deu erro , exiber erro
        }

        user.password = encryPassword(user.password) //criptografando senha
        delete user.confirmPassword //deletando confirmação de senha, por que não sera incerida

        //Alteração
        if(user.id){
            app.db('users')
                .update(user)
                .where({id: user.id})
                .whereNull('deletedAt') //Trazer apenas usuarios que contem o atributo deletedAt = nullo, que são os que não estão marcados como excluidos
                .then(_ => res.status(204).send()) //mensagem caso caso cadastre com sucesso
                .catch(err => res.status(500).send(err)) //mensagem recebida caso ocorra algum erro
        }
        //Cadastro
        else{
            app.db('users')
            .insert(user)
            .then(_ => res.status(204).send())
            .catch(err => res.status(500).send(err))
        }
    }

    //METODO PARA EXIBIR TODOS USUARIOS
    const get = (req, res) => {
        app.db('users')
            .whereNull('deletedAt')
            .select('id', 'name', 'email', 'admin')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    //METODO PARA EXIBIR USUARIOS PELO ID
    const getById = (req, res) => {
        userID = req.params.id
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .where({id: userID})
            .whereNull('deletedAt')
            .first()
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    //METODO PARA MARCAR USUARIO COMO EXCLUIDO (não ira excluir do banco, porem não aparecera no frontend)
    const remove = async (req, res) => {
        try {
            //Verificando se o usuario tem artigos
            const articles = await app.db('articles') //Pegando artigos vinculados ao usuario a ser excluido
                .where({userId: req.params.id})
            notExistsOrError(articles, 'Usuario possui artigos') //Se o usuario tiver artigos vinculados, não deixar exclui-lo
            
            //Excluindo o usuario
            const rowsUpdated = await app.db('users')
                .update({deletedAt: new Date()}) //Marcando o usuario como excluido colocando a data de exclusão
                .where({id: req.params.id})
            existsOrError(rowsUpdated, 'Usuario não foi encontrado')

            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }

    return {save, get, getById, remove} //quando a função for chamada, ira retornar tudo que se quer exportar
}