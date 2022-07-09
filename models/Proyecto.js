import mongoose from "mongoose";

const proyectosSchema = mongoose.Schema({

    nombre: {
        type: String,
        required: true, 
        trim: true
    },
    descripcion: {
        type: String,
        required: true, 
        trim: true
    },
    fechaEntrega:{
        type: Date,
        required: true, 
        default: Date.now()
    },
    cliente: {
        type: String,
        required: true, 
        trim: true
    },
    //el creador se poe esta forma por que tiene que ser del tipo ussuario
    creador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
    },

    tareas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tarea",
        }
    ],

    //colaboladores es un arreglo por que puede existir varios colaboladores
    colaboladores: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Usuario"
        },
    ],

},{
    //esto crea los campos uspate-at y create-at
    timestamps: true
});

const Proyecto = mongoose.model("Proyecto", proyectosSchema);

export default Proyecto;