//Arquivo de validação de dados, antes de entrarem no banco

module.exports = app => {
    //função que verificara tentativar de passar valores vazios
    function existsOrError(value, msg){
        if(!value) throw msg //verificando se value é vazio
        if(Array.isArray(value) && value.length === 0) throw msg //verificando se value é um array vasio
        if(typeof value === 'string' && !value.trim()) throw msg //verificando se é uma string apenas com espaços '  ')
    }

    //Função que verifica se determinado dado ja existe (exemplo : no cadastro, verificar se usuario ja tem cadastro, antes de cadastralo)
    function notExistsOrError(value, msg) {
        try {
            existsOrError(value, msg)
        } catch (msg) {
            return
        }
        throw msg
    }

    //Verificando se dois valores são iguais (se não forem , é erro) (exemplo , metodo utilizado em confirmação de senha)
    function equalsOrError(valueA, valueB, msg){
        if(valueA !== valueB) throw msg
    }

    return {existsOrError , notExistsOrError, equalsOrError}
}