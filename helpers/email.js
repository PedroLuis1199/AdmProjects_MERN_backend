import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {

    const {email, nombre, token} = datos

    //codigo tomado de mailtrap

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      //Informacion del email

      const info = await transport.sendMail({
          from: '"Administrador de Proyectos" - <cuentas@uptask.com>',
          to: email,
          subject:" Confirma tu cuenta",
          text: "Comprueba tu cuenta en el Administrador de Proyectos",
          html: `<p>Hola ${nombre} Comprueba tu cuenta en el Administrador de Proyectos</p>
          <p>Tu cuenta esta casi lista, solo debes comprobarla en el siguiente enlace:
          <a href = "${process.env.FRONTEND_URL}/confirmar/${token}">Comprueba tu cuenta</a>
          </p>
          
          <p>Si tu no creaste esta cuenta puedes ignorar el mensaje</p>
          
          
          
          `
      })

}

//email en caso de que el usuario haya olvidado su password

export const emailOlvidePassword = async (datos) => {

  const {email, nombre, token} = datos

  //codigo tomado de mailtrap

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
    });

    //Informacion del email

    const info = await transport.sendMail({
        from: '"Administrador de Proyectos" - <cuentas@uptask.com>',
        to: email,
        subject:" Reestablce tu password",
        text: "Reestablce tu password",
        html: `<p>Hola ${nombre} has solicitado reestablcer tus contraseña</p>
        <p>Sigue el siguiente enlace para generar un password:
        <a href = "${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a>
        </p>
        
        <p>Si tu no solicitaste reestablcer tu contraseña  puedes ignorar el mensaje</p>
        
        
        
        `
    })

}