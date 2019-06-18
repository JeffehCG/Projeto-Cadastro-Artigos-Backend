module.exports = app => {
    const { existsOrError , notExistsOrError } = app.api.validation

    //METODO PARA ALTERAR E CADASTRAR
    const save = (req, res) => {
        const category = {
            id: req.body.id,
            name: req.body.name,
            parentId: req.body.parentId
        }
        if(req.params.id) category.id = req.params.id

        //validação
        try {
            existsOrError(category.name, 'Nome não informado')
        }catch(msg){
            return res.status(400).send(msg)
        }

        //alteração
        if(category.id){
            app.db('categories')
                .update(category)
                .where({id: category.id})
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
        //Cadastro
        else{
            app.db('categories')
                .insert(category)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    //METODO PARA REMOVER
    const remove = async (req, res) => {

        //validação
        try {
            existsOrError(req.params.id, 'Código de Categoria não informado')

            //verificando se a categoria tem sub categorias
            const subCategory = await app.db('categories')
                .where({parentId: req.params.id})
            notExistsOrError(subCategory, 'Categoria possui subcategorias') //se tiver, exibir erro

            //verificando se tem artigos associados
            const articles = await app.db('articles')
                .where({categoryId: req.params.id})
            notExistsOrError(articles, 'Categoria possui artigos associados') //se tiver, exibir erro

            //se não der nenhum erro de validação acima, excluir
            const rowsDeleted = await app.db('categories')
                .where({id: req.params.id}).del()
            existsOrError(rowsDeleted, 'Categoria não foi encontrada') //se a categoria pesquisada não for encontrada, exibir erro

            res.status(204).send()

        }catch(msg){
            return res.status(400).send(msg)
        }
    }

    //METODO PARA CRIAR LISTA DE CATEGORIAS COM O CAMINHO DE PAI PARA FILHO
    const withPath = categories => {

        //Metodo que recebe uma lista de categorias, e retorna cada categoria individualmente com um atributo a mais (path)
        const getParent = (categories, parentId) => {
            const parent = categories.filter(parent => parent.id === parentId) //encontrando a categoria pai de cada categoria
            return parent.length ? parent[0]: null //Retorna o primeiro valor do array, se parent estiver vazio retonar nullo
    }

        //transformara o array de categorias, em outro array de categorias, porem com um atriuto a mais (path - caminho do filho até o pai)
        const categoriesWithPath = categories.map(category => {
            let path = category.name
            let parent = getParent(categories, category.parentId)

            while(parent){ //Montando o path / quando parent for nullo ira sair do while
                path = `${parent.name} > ${path}`
                parent = getParent(categories, parent.parentId)
            }

            return{...category,path} //Retornando as categorias com o caminho 
        })

        //Metodo para ordenar array em forma alfabetica
        categoriesWithPath.sort((a,b) => {
            if(a.path < b.path) return -1 
            if(a.path > b.path) return 1
            return 0
        })

        return categoriesWithPath
    }

    //METODO PARA LISTAR AS CATEGORIAS
    const get = (req, res) => {
        app.db('categories')
            .then(categories => res.json(withPath(categories))) //Recebendo categorias com caminho
            .catch(err => res.status(500).send(err))
    }

    //METODO PARA PEGAR CATEGORIA POR ID
    const getById = (req, res) => {
        app.db('categories')
            .where({id: req.params.id})
            .first()
            .then(category => res.json(category))
            .catch(err => res.status(500).send(err))
    }

    //METODOS PARA EXIBIÇÃO DAS CATEGORIAS EM ARVORE (exibindo o pai, e dentro dele os filhos)

    //Metodo para transformar lista de categorias em uma estrutura de arvore
    const toTree = (categories, tree) => {//na primeira passagem pela função tree sera nullo
        if(!tree) tree = categories.filter(c => !c.parentId) //pegando todas categorias que o parentId é vazio (pais)
        
        //Pegando os filhos de cada categoria pai
        tree = tree.map(parentNode => {
            const isChild = node => node.parentId == parentNode.id
            parentNode.children = toTree(categories, categories.filter(isChild)) //Função recursiva (que chamara ela mesma varias vezes, para procurar cada filho) 
            return parentNode
        })
        return tree
    }

    //Metodo para receber todas categorias do banco de dados, e depois tranformar em uma estrutura de arvore
    const getTree = (req, res) => {
        app.db('categories')
            .then(categories => res.json(toTree(categories)))
    }

    return{save, remove, get, getById, getTree}
}