
import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js'

/********** Registrar usuario **********/ 


const registrar = async (req, res) => {

//Evitar duplicados de registros revisando el correo que ya existe
    const {email}= req.body
    const existeUsuario = await Usuario.findOne({email})

    if(existeUsuario){
        const error = new Error('Usuario ya resgistrado')
        return res.status(400).json({msg: error.message})
    }
//Enviar datos del usuario a la base datos
    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId() //asignar id generado
        await usuario.save();

        //Enviar email de confirmacion
        //A la funcion le pasamos estos datos necesarios para la confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: 'Usuario almacenado correctamente, revisa tu email para confirmar tu cuenta'});

    } catch (error) {
        console.log(error)
    }

}

/********** Autenticar usuario **********/ 

const autenticar = async (req, res) => {

    const {email, password} = req.body;//se extraer del request 

    //Comprobar si el usuario existe

    const usuario = await Usuario.findOne({email}) 
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }

    //Comprobar si es usuario esta confirmado

    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({msg: error.message})
    }

    //Confirmar su password

    if(await usuario.comprobarPassword(password)){

       res.json({
           _id: usuario._id,
           nombre: usuario.nombre,
           email: usuario.email,
           token: generarJWT(usuario._id)
       });

    }

    else{
        const error = new Error('Tu password es incorrecto')
        return res.status(403).json({msg: error.message})
    }

   

}

/********** Confirmar usuario **********/ 

const confirmar = async (req, res) => {

    const {token} = req.params // se obtiene asi por que viene por la url

    const usuarioConfirmar = await Usuario.findOne({token})//select

    if(!usuarioConfirmar){
        const error = new Error('token no valido')
        return res.status(403).json({msg: error.message})
    }

    try {
        
        usuarioConfirmar.confirmado = true //cambiamos a true en campo en la base datos
        usuarioConfirmar.token = "" // eliminamos el token
        await usuarioConfirmar.save(); // guardamos los cambios en la bd
        res.json({msg: 'Usuario confirmado'})
      
    } 
    catch (error) {
        console.log(error)
    }

}


/********** recuperar contraseña **********/ 

const olvidePassword = async (req, res) => {

    const {email} = req.body

    const usuario = await Usuario.findOne({email}) // select para traer el email
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({msg: error.message})
    }
   

    try {
        usuario.token = generarId()
        await usuario.save();

        //enviar email

        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        
        res.json({msg: 'Hemos enviado un correo con las instrucciones para la verificacion'})
    } catch (error) {
        console.log(error)
    }



}

const comprobarToken = async (req, res) => {

    const {token} = req.params// se usa params por que viene por la url lo que ocupamos del req

    const tokenValido = await Usuario.findOne({token})

    if(tokenValido){
        res.json({msg: 'Token valido'})
    }
    else{
        const error = new Error('El token no valido')
        return res.status(404).json({msg: error.message})
    }

}

/********** crear nuevo password **********/ 

const nuevoPassword = async (req, res) => {

    const {token} = req.params//se toma el token de a url
    const {password} = req.body//se toma el password del request

    const usuario = await Usuario.findOne({token})

    if(usuario){
        usuario.password = password//le pasamos a password el password que estamos enviando es decir el que esta em req.body
        usuario.token = ""
        
        try {
            await usuario.save()
        res.json({msg: 'password cambiado con exito'})
        } catch (error) {
            console.log(error)
        }
    }
    else{
        const error = new Error('El token no valido')
        return res.status(404).json({msg: error.message})
    }

}

const perfil = async (req, res) => {

    const {usuario} = req //accdemos a usuario ya que cuando el usuario esta autenticado se almacena aqui 

    res.json(usuario)

}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil}; 