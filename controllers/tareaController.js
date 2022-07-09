import Proyecto from "../models/Proyecto.js"
import Tareas from "../models/Tareas.js"

const agregarTarea = async (req, res)=>{

    const {proyecto }= req.body //extraemos el id del proyecto que se incluye cuando se agrega una tarea

    const existeProyecto = await Proyecto.findById(proyecto)

    //comprobar si existe el proyecto al cual se quiere agregar la tarea
    if(!existeProyecto){
        const error = new Error('el proyecto no existe')
        return res.status(404).json({msg: error.message})
    }

    //comprobar si quien creo la tarea es quien creo el proyecto
    if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('no tienes los permisos')
        return res.status(403).json({msg: error.message})
    }

    try {
        const tareaAlmacenada =  await Tareas.create(req.body);
        //Almcenar el id de la tarea en el proyecto al cual pertence
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save();
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
  
}

const obtenerTarea = async (req, res)=>{

    const {id} = req.params

    const tarea = await Tareas.findById(id).populate("proyecto")

    //comprobando si existe la tarea
    if(!tarea){
        const error = new Error('tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    //comprobacion para quien obtenga la tarea se unicamente el que la creo y el mismo que creo el proyecto
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('accion no valida')
        return res.status(403).json({msg: error.message})
    }
  
    res.json(tarea)
    
}

const actualizarTarea = async (req, res)=>{

    const {id} = req.params

    const tarea = await Tareas.findById(id).populate("proyecto")

    //comprobando si existe la tarea
    if(!tarea){
        const error = new Error('tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    //comprobacion para quien obtenga la tarea se unicamente el que la creo y el mismo que creo el proyecto
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('accion no valida')
        return res.status(403).json({msg: error.message})
    }
  
    //actualizando tarea
    tarea.nombre = req.body.nombre || tarea.nombre //asignando el nombre a la tarea 
    tarea.descripcion= req.body.descripcion || tarea.descripcion //asignando descripcion a la tarea 
    tarea.prioridad = req.body.prioridad|| tarea.prioridad //asignando prioridad a la tarea 
    tarea.fechaEntrega = req.body.fechaEntrega|| tarea.fechaEntrega//asignando el nombre a la tarea 

    //guardando los registros actualizados
    try {
        const tareaAlmacenada = await tarea.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
    
}

const eliminarTarea = async (req, res)=>{

    const {id} = req.params

    const tarea = await Tareas.findById(id).populate("proyecto")

    //comprobando si existe la tarea
    if(!tarea){
        const error = new Error('tarea no encontrada')
        return res.status(404).json({msg: error.message})
    }

    //comprobacion para quien obtenga la tarea se unicamente el que la creo y el mismo que creo el proyecto
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('accion no valida')
        return res.status(403).json({msg: error.message})
    }

    //eliminando tarea
    try {
//eliminar tarea del arreglo que tiene los proyectos para almacenarlas

    const proyecto = await Proyecto.findById(tarea.proyecto)
    proyecto.tareas.pull(tarea._id)

    //esta linea ahce que los await se ejecuten paralelamente
    await Promise.allSettled([await proyecto.save(), await tarea.deleteOne() ])

        res.json({msg: 'La tarea se ha eliminado'})
    } catch (error) {
        console.log(error)
    }
    
}

const cambiarEstado = async (req, res) =>{

    
    const {id} = req.params

    const tarea = await Tareas.findById(id).populate("proyecto")

    //comprobando si existe la tarea
    if(!tarea){
        const error = new Error('tarea no encontrada')
        return res.status(404).json({msg: error.message})
    } 

       //comprobacion para quien obtenga la tarea se unicamente el que la creo y el mismo que creo el proyecto
       if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() 
       && !tarea.proyecto.colaboladores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Accion no valida')
        return res.status(403).json({msg: error.message})
    }

    //cambio de estado de la tarea
    tarea.estado = !tarea.estado
    tarea.completado= req.usuario._id//linea agregada ya que es necesaria para poder mostrar que colaborador que completado la tarea 
    await tarea.save()

    const tareaAlmacenada = await Tareas.findById(id).populate('proyecto').populate('completado')

    res.json(tareaAlmacenada)
    
}

export {
    agregarTarea, obtenerTarea, actualizarTarea, eliminarTarea, cambiarEstado
}