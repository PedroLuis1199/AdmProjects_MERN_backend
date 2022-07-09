import conectarDB from './config/db.js';
import express from 'express'
import cors from 'cors'
import dotenv from "dotenv"
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express() 
 
app.use(express.json());//esta linea permite procesar la informacion de tipo json

dotenv.config()//entorno

conectarDB()//llamado para conectarse a la bd

//*********configurar cors**********//
//process.env.FRONTEND_URL
const whitelist = ["http://localhost:3000"];

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)) {
            //Puede consultar la api
            callback(null, true)

        }else{
            callback(new Error('Error de CORS'))
        }
    }
}

app.use(cors(corsOptions))
//*******************//

app.use("/api/usuarios", usuarioRoutes );//ruta para usuarios
app.use("/api/proyectos", proyectoRoutes  );// ruta para proyectos
app.use("/api/tareas", tareaRoutes  );// ruta para tareas

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`corriendo en ${PORT}`)
});


//Socket.io
import { Server } from 'socket.io';

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors:{
        origin: process.env.FRONTEND_URL
    }
});

//Abrir conexion

io.on('connection', (socket) => {
    //console.log('conectado a socket');

    //Definir eventos de socket.io

    /*socket.on('prueba', (nombre) => {
        console.log('prueba desde socket io', nombre)

        //respuesta hacia el frontend
        socket.emit('respuesta', {nombre: 'peter'})
    })*/

    socket.on('abrir proyecto', (proyecto) => {
        //console.log('desde el proyecto', proyecto)
        socket.join(proyecto)

    });
    socket.on('nueva tarea' , (tarea ) => {

        //console.log(tarea)
          const proyecto  = tarea.proyecto;
          socket.to(proyecto).emit('tarea agregada', tarea)
    })

    //eliminar tarea
    socket.on('eliminar tarea' , tarea  => {

        //console.log(tarea)
          const proyecto  = tarea.proyecto;
          socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    //actualizar tarea
    socket.on('actualizar tarea' , tarea  => {

        //console.log(tarea)
          const proyecto = tarea.proyecto._id;
          socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    //cambiar estado tarea
    socket.on('cambiar estado' , tarea  => {

        //console.log(tarea)
          const proyecto = tarea.proyecto._id;
          socket.to(proyecto).emit('nuevo estado', tarea)
    })





})