import express from 'express'
import {obtenerProyectos, nuevoProyecto, obtenerProyecto, editarProyecto, eliminarProyecto, buscarColabolador, agregarColabolador, 
        eliminarColabolador }
from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'


const router = express.Router()

router.route("/").get(checkAuth, obtenerProyectos).post(checkAuth, nuevoProyecto)

//estas rutas necesitan el id para poder obtene,editar y eliminar proyectos de acuerdo al id  
router
.route("/:id")
.get(checkAuth, obtenerProyecto)
.put(checkAuth, editarProyecto)
.delete(checkAuth, eliminarProyecto)


//Buscar colaborador
router.post('/colaboradores', checkAuth, buscarColabolador)
router.post('/colaboradores/:id', checkAuth, agregarColabolador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColabolador)




export default router;