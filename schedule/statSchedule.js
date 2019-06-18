//Modulo que ira fazer o transporte de dados do postgres para o mongo, para calcular as estatisticas

const schedule = require('node-schedule') //dependencia para fazer com que as estatisticas sejam atualizadas de tempos em tempos(Um temporizador)

module.exports = app => {
    schedule.scheduleJob('*/1 * * * *', async function () { //'*/1 * * * *' - de quanto em quanto tempo o schedule sera executado (1 - minuto) (para mais informações , ler documentação de node-schedule)
        const usersCount = await app.db('users').count().first() //Recebendo a quantidade de usuarios
        const categoriesCount = await app.db('categories').count().first()
        const articlesCount = await app.db('articles').count().first()

        const {Stat} = app.api.stat //pegando o modelo de stat

        const lastStat = await Stat.findOne({},{},{sort: {'createdAt': -1}}) //Pegando a ultima estatistica

        const stat = new Stat({ //Criando o novo Stat
            users: usersCount.count,
            categories: categoriesCount.count,
            articles: articlesCount.count,
            createdAt: new Date () 
        })

        const changeUsers = !lastStat || stat.users !== lastStat.users //se a ultima estatistica não estiver setado, ou a nova qt de usuarios for diferente da antiga
        const changeCategories = !lastStat || stat.categories !== lastStat.categories
        const changeArticles = !lastStat || stat.articles !== lastStat.articles

        if (changeUsers || changeCategories || changeArticles) { //se algum dos dados mudou
            stat.save() //Salvando novas estatisticas
                .then(() => console.log ('[Stats] Estatisticas atualizadas'))
        }
    }) 
}