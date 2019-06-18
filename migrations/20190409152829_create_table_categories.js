
exports.up = function(knex, Promise) {
    return knex.schema.createTable('categories', table => {
        table.increments('id').primary()
        table.string('name').notNull()
        table.integer('parentId').references('id') //Uma coluna que se referencia com a propria tabela
            .inTable('categories') // Uma categoria pai tera varias categorias filhas
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('categories')
};
