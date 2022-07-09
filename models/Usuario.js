import mongoose from "mongoose";
import bcrypt from 'bcrypt'

const usuarioShema = mongoose.Schema({
    nombre: {
        type: String,
        required: true, 
        trim: true
    },
    password: {
        type: String,
        required: true, 
        trim: true
    },

    email: {
        type: String,
        required: true, 
        trim: true,
        unique: true
    },

    token:{
        type: String
    },

    confirmado:{
        type: Boolean,
        default: false
    },

}, {

    timestamps: true, 

});


//Codigo para ocultar los passwords que ingresan a la base de datos
usuarioShema.pre('save', async function(next) {
 
    //este condicional  va revisar que el password no haya sido cambiado
    //sino se esta modificando el password no haga nada
    if(!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)

}) 

//confirmacion de password

usuarioShema.methods.comprobarPassword = async function(passwordFormulario){

    return await bcrypt.compare(passwordFormulario, this.password)

}

//******************************************************** */

const Usuario = mongoose.model("Usuario", usuarioShema);

export default Usuario;