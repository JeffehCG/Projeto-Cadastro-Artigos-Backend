// const user = require ('../api/user') -- se não tivesse o consing deveria importar dessa maneira
//Arquivo de rotas do sistema

const admin = require('./admin') //Função que verificara se o usuario é admin, do contrario bloqueis requisições

module.exports = app => {
    //Rotas de autentificação de usuario
    app.post('/signup', app.api.user.save) //Rota para cadastro comum
    app.post('/signin', app.api.auth.signin)
    app.post('/validateToken', app.api.auth.validateToken)

    app.route('/users') //quando for recebido uma requisição com essa URL, e com metodo post
        .all(app.config.passport.authenticate()) //Metodo de autentificação, só podera efetuar as requisições abaixo se o usuario estiver autentificado
        .post(admin(app.api.user.save)) //com o uso do consign todos metodos que são exportados estaram dentro de app (assim chamando o metodo save do arquivo user.js) (Rota de cadastro de admin)
        .get(admin(app.api.user.get))
    
    app.route('/users/:id')
        .all(app.config.passport.authenticate())   
        .put(admin(app.api.user.save))
        .get(admin(app.api.user.getById)) //Rotas com a função admin só poderam ser acessadas pelo administrados
        .delete(admin(app.api.user.remove))
    
    app.route('/categories')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.category.get))
        .post(admin(app.api.category.save))

    //Cuidado com a ordem! Rota mais genericas tem que vir antes, e contendo Id depois
    app.route('/categories/tree')
        .all(app.config.passport.authenticate())
        .get(app.api.category.getTree)

    app.route('/categories/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.category.getById)
        .put(admin(app.api.category.save))
        .delete(admin(app.api.category.remove))

    app.route('/articles')
        .all(app.config.passport.authenticate())
        .get(admin(app.api.article.get))
        .post(admin(app.api.article.save))
    
    app.route('/articles/:id')
        .all(app.config.passport.authenticate())
        .get(app.api.article.getById)
        .put(admin(app.api.article.save))
        .delete(admin(app.api.article.remove))
    
    app.route('/categories/:id/articles')
        .all(app.config.passport.authenticate())
        .get(app.api.article.getByCategory)

    app.route('/stats')
        .all(app.config.passport.authenticate())
        .get(app.api.stat.get)
}