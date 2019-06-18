//Pesquisas sql

module.exports = { //WITH cria uma tabela temporaria , nesse caso a subcategories 
    //Nesse query , ira pegar o id da categoria passada por parametro '?' e todas catogorias filhas da mesma
    categoryWithChildren: `
        WITH RECURSIVE subcategories (id) AS (
            SELECT id FROM categories WHERE id = ?
            UNION ALL
            SELECT c.id FROM subcategories, categories c
                WHERE "parentId" = subcategories.id
        )
        SELECT id FROM subcategories
    `
}