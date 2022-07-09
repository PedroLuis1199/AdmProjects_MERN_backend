import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {

    let token;
 if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){

    try {

        token = req.headers.authorization.split(" ")[1];//con esto nos traemos unicamente el token

        const decoded = jwt.verify(token, process.env.JWT_SECRET)//aqui accdemos al token
        
        req.usuario = await Usuario.findById(decoded.id).select("-password -confirmado -token -createdAt -updateAt -__v")//aqui obtenemos la respiesta y le quitamos el password para mayor seguridad

        return next()
    } catch (error) {
        return res.status(404).json({msg: 'hubo un error'})
        
    }
 };

 if(!token ){

    const error = new Error ('Token  no valido')
    return  res.status(401).json({msg: error.message })

 }

    next()//este llamado se pone por que es necesario para que funcione el middleware
}

export default checkAuth;