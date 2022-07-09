import express from 'express'
import  {registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil} from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'
const router = express.Router()

//Autenticacion, registro y confirmacion de usuarios

router.post('/', registrar) //Crea un nuevo usuario
router.post('/login', autenticar) // Autenticar usuario
router.get('/confirmar/:token', confirmar) //confirmar usuario, es get por que se necesita traer el token de la bd r
router.post('/olvide-password', olvidePassword) // recuperar password
/*router.get('/olvide-password/:token', comprobarToken)
router.post('/olvide-password/:token', nuevoPassword)//para nueva contraseña*/
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)//esta linea hace lo mismo que la dos anteriores pero es una form,a de simplificar

router.get('/perfil', checkAuth, perfil)//ruta del middleware

export default router; 