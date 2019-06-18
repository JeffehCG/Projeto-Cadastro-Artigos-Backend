//Modulo que ira retornar as statisticas do mongoDB

module.exports = app => {
    const Stat = app.mongoose.model('Stat', { //Criando modelo do stat que sera salvo no mongo
        users: Number, //qt usuarios
        categories: Number, // qt categorias
        articles: Number, //qt artigos
        createdAt: Date //data de criação 
    })

    //Metodo que ira pegar as estatisticas do mongo
    const get = (req, res) => {

        const defautStat ={ //Caso estatistica esteja vazia, enviar esses parametros zerados
            users: 0,
            categories: 0,
            articles: 0,
        }

        Stat.findOne({}, {}, {sort: {'createdAt': -1}}) //Recebendo do mongoDb a ultima estatistica (Primeiro parametro {Filtragem}, Segundo {Atributo que sera buscado}) sort{'createdAt':-1} - ultima statistica gravada
            .then(stat => res.json(stat || defautStat))
            .catch(err => err.status(400).send())
    }

    return{Stat, get}
}