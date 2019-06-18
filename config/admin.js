//Função que ira receber um middleware, e fara a verificação se o usuario é um admin
module.exports = middleware => {
    return (req, res, next) => {
        if(req.user.admin){
            middleware(req,res,next) //se o usuario for um admin, retornar o middleware passado por parametro
        }else {
            res.status(401).send('Usuario não é administrador')
        }
    }
}