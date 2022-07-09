import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tareas.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {

    const proyectos = await Proyecto.find({
        $or : [
            {colaboladores: {$in: req.usuario}},
            {creador: {$in: req.usuario}}
        ]
    }).select("-tareas")
//lo que se añade al find es un tipo where o condicion dentro de la consulta    
//se añade el .select para quitar el campo de tareas, ya que en esta consulta no es necesario traerlas
    res.json(proyectos)

}

const nuevoProyecto = async (req, res) => {

    const proyecto = new Proyecto(req.body)//esta linea hace la instancia y envia lo que esta en el request
    proyecto.creador = req.usuario._id //se asigna el creador de acuerdo al id de un usuario autenticado 

    try {
        const proyectoAlmacenado =  await proyecto.save();
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
    
}

const obtenerProyecto = async (req, res) => {

    const {id} = req.params;
    
    const proyecto = await Proyecto.findById(id)
    .populate({path: 'tareas', populate: {path:'completado', select: 'nombre'}})
    .populate('colaboladores', 'nombre email')//esto hace que se traiga el nombre y emial de lo colaboradores


    //evaluar si existe el id que viene por la url
    if(!proyecto){
        const error = new Error("no encontrado")
        return res.status(404).json({msg: error.message});
    }

    //comparar id para obtener unicamente los proyectos de la persona que esta autenticado al momento de realizar el request
    if(proyecto.creador.toString() !== req.usuario._id.toString() 
    && !proyecto.colaboladores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString()) ){

        
        const error = new Error("accion no valida")
        return res.status(401).json({msg: error.message});
    }

    //Obtener tareas del proyecto el cual estamos consultando
   // const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)//se le pasa proyecto, por que este campo almecena un id

    //almacenamos en un objeto el proyecto consultado y las tareas que este tiene
   //const respuesta = {...proyecto, ...tareas}

   res.json(proyecto)

    

}

const editarProyecto = async (req, res) => {

    const {id} = req.params 
    
    const proyecto = await Proyecto.findById(id)


    //evaluar si existe el id que viene por la url
    if(!proyecto){
        const error = new Error("no encontrado")
        return res.status(404).json({msg: error.message});
    }

    //comparar id para obtener unicamente los proyectos de la persona que esta autenticado al momento de realizar el request
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("accion no valida")
        return res.status(404).json({msg: error.message});
    }

    //actualizando registro
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega|| proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {

        console.log(error)
        
    }


    

}

const eliminarProyecto = async (req, res) => {

    const {id} = req.params 
    
    const proyecto = await Proyecto.findById(id)


    //evaluar si existe el id que viene por la url
    if(!proyecto){
        const error = new Error("no encontrado")
        return res.status(404).json({msg: error.message});
    }

    //comparar id para obtener unicamente los proyectos de la persona que esta autenticado al momento de realizar el request
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("accion no valida")
        return res.status(404).json({msg: error.message});
    }

    //eliminado proyecto

    try {
        await proyecto.deleteOne()
        res.json({msg: 'Proyecto eliminado'})
    } catch (error) {
        console.log(error)
    }

}

const buscarColabolador = async (req, res) => {

    const {email} = req.body
    
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message});
    }

    res.json(usuario)
}

//Agregar colaborador

const agregarColabolador = async (req, res) => {

    const proyecto = await Proyecto.findById(req.params.id)
//verificar que el proyecto exista
    if(!proyecto){
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({msg: error.message});
    }

    //validacion para unicamente el que creo el proyecto pueda agregar colaboradores
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error("Accion no valida")
        return res.status(404).json({msg: error.message});
    }
    //console.log(req.body)
    //se extrae el email del request 
    const {email} = req.body
    

    //validacion para verificar que el colaborador por añadir exista
    const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario){
        const error = new Error("Usuario no encontrado")
        return res.status(404).json({msg: error.message});
    }

    //revisar que el colaborador por agregar no sea el creador del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error("El creador del proyecto no puede ser agregado como un colaborador")
        return res.status(404).json({msg: error.message});
    }

    //revisar que el colaborador por agregar ya no este anteriormente agregado
    if(proyecto.colaboladores.includes(usuario._id)){
        const error = new Error("El usuario que desea agregar ya fue añadido a este proyecto anteriomente")
        return res.status(404).json({msg: error.message});
    }
    //Pasando todas las validaciones se agrega el colaborador
    proyecto.colaboladores.push(usuario._id)
    await proyecto.save()
    res.json({msg: 'Colaborador agregado correctamente'})
}

//Eliminando colaborador

const eliminarColabolador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)
    //verificar que el proyecto exista
        if(!proyecto){
            const error = new Error("Proyecto no encontrado")
            return res.status(404).json({msg: error.message});
        }
    
        //validacion para unicamente el que creo el proyecto pueda eliminar colaboradores
        if(proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("Accion no valida")
            return res.status(404).json({msg: error.message});
        }
        //eliminacion del colaborador
        proyecto.colaboladores.pull(req.body.id)
        await proyecto.save()
        res.json({msg: 'Colaborador eliminado correctamente'})
}

/*const obtenerTareas = async (req, res) => {

    const {id} =  req.params

    const existeProyecto = await Proyecto.findById(id);

    //comprobando si existe el proyecto
    if(!existeProyecto){
        const error = new Error('No encontrado')
        return res.status(404).json({msg: error.message})

    }

    //obteniendo tareas de acuerdo al id del proyecto, este id que viene por la url
    const tareas = await Tarea.find().where('proyecto').equals(id)

    res.json(tareas)
}
*/
export {obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, agregarColabolador, 
    eliminarColabolador, buscarColabolador}