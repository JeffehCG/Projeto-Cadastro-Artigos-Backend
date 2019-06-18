const queries = require("./queries")

module.exports = app => {
    const { existsOrError} = app.api.validation

    //METODO PARA SALVAR E ALTERAR
    const save = (req,res) => {
        const article = {...req.body}
        if(req.params.id) article.id = req.params.id
    
        //validações
        try {
            existsOrError(article.name,'Nome não informado')
            existsOrError(article.description, 'Descrição não informada')
            existsOrError(article.categoryId, 'Categoria não informada')
            existsOrError(article.userId,'Autor não informado')
            existsOrError(article.content,'Conteúdo não informado')
        } catch (msg) {
            return res.status(400).send(msg)
        }

        if(article.id) {
            app.db('articles')
                .update(article)
                .where({id: article.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }else{
            app.db('articles')
                .insert(article)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    //METODO PARA REMOVER REGISTRO
    const remove = async (req,res) => {
        try {
            const rowsDeleted = await app.db('articles')
                .where({id: req.params.id}).del()

            try { //Dois tryCatch porque o primeiro é pra verificar digitação errada, e o segundo, erro interno do sistema
                existsOrError(rowsDeleted, 'Artigo não foi encontrado')
            } catch (msg) {
                res.status(400).send(msg)
            }

            res.status(204).send()
        } catch (msg) {
            res.status(500).send(msg)
        }
    }

    const limit = 3 //Limitando a paginação (irar trazer 3 registros por vez)
   
    //METODO DE CONSULTA PAGINADA
    const get = async (req, res) => {
        const page = req.query.page || 1 //Recebendo a pagina que esta , ou se o parametro estiver vazio recebe 1

        const result = await app.db('articles').count('id').first() //recebendo a quantidade total de registros
        const count = parseInt(result.count) //convertendo quantidade para inteiro

        app.db('articles')
            .select('id', 'name' , 'description') //.limit() -- limita a quantidade de registros puchados
            .limit(limit).offset(page * limit - limit) //.offset() --apartir de que registro sera pego, de acordo com a pagina (exemplo, se o usuario estiver na pagina 2 (2 * 10 - 10 = 10) ou seja, ira pegar do registro 10 aou 20)
            .then(articles => res.json({data : articles, count, limit})) //retornando artigos dentro de data, e o count e o limit para serem usados no 
            .catch(err => res.status(500).send(err))
    }

    //METODO PARA LISTAR PELO ID
    const getById = (req, res) => {
        app.db('articles')
            .where({id: req.params.id})
            .first()
            .then(article => {
                article.content = article.content.toString() //Convertendo formato binario para string
                return res.json(article)
            })
            .catch(err => res.status(500).send())
    }

    //METODO PARA LISTAR ARTIGOS PELAS CATEGORIAS
    const getByCategory = async (req, res) => {

        //Pegando o id da categoria e subcategorias (pai e filhas)
        categoryId = req.params.id //Para fazer a consulta devera ser passado o ID da categoria
        const page = req.query.page || 1 //pegando pagina
        const categories = await app.db.raw(queries.categoryWithChildren, categoryId) //.raw() --Função do knex, onde você pode fazer consultas sql mais elaboradas /Essas consultas estão criadas dentro do arquivo queries.js
        const ids = categories.rows.map(c => c.id) //pegando os ids das categorias encontradas (pai e filhas)

        //Consulta que ira obter os artigos vinculados com os id encontrados anteriormente
        app.db({a: 'articles', u: 'users'})//trabalhando com duas tabelas
            .select('a.id', 'a.name', 'a.description', 'a.imageUrl' ,{author: 'u.name'}) //{author: 'u.name'} - apelido
            .limit(limit).offset(page * limit - limit)
            .whereRaw('?? = ??', ['u.id', 'a.userId']) //igualando as tabelas , para associar a chave estrangeira com o respectivo id, para fazer o join
            .whereIn('categoryId', ids) //whereIn - fazendo where com mais de um valor / pegando apenas os artigos que estejam associados com os ids puxados acima
            .orderBy('a.id', 'desc') //ordenando
            .then(articles => res.json(articles))
            .catch(err => res.status(500).send(err))
    }

    return {save, remove, get, getById, getByCategory}
}