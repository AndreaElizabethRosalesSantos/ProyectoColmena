// controllers/suscripcionController.js

const nodemailer = require('nodemailer');
const suscripcionModel = require('../model/suscripcionModel');

// POST /api/suscribir
// Manejo de suscripcion: guarda correo y envia email con cupon
const suscribirUsuario = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar campos obligatorios
    if (!email) 
      return res.status(400).json({ mensaje: 'El correo es obligatorio' });

    // Guardar correo en BD 
    try {
      await suscripcionModel.guardarCorreo(email);
    } catch (error) {
      console.warn("No se pudo guardar en la base de datos (puede ser correo duplicado).");
    }

    // Configuracion del correo
    const empresa = "La Colmena";
    const lema = "Cuando tu día sea amargo, agrégale miel ";
    const cupon = "DESCUENTO10";

    const transporter = nodemailer.createTransport({
        //se usara gmail
        service: "gmail",
        // Se usan variables del .env para seguridad
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Plantilla del correo
    const htmlMensaje = `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:20px 0; font-family: Arial, sans-serif;">
  <tr>
    <td align="center">

      <!-- CONTENEDOR PRINCIPAL -->
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; border:1px solid #e5d7c7; padding:20px;">

        <!-- LOGO -->
        <tr>
          <td align="center" style="padding-bottom: 15px;">
            <img src="cid:logoempresa" style="width:100%; max-width:600px; border-radius:10px;" />
          </td>
        </tr>

        <!-- TITULO -->
        <tr>
          <td align="center" style="color:#483625; font-size:26px; font-weight:bold; padding-top:10px;">
            ¡Gracias por unirte a La Colmena!
          </td>
        </tr>

        <!-- LEMA -->
        <tr>
          <td align="center" style="color:#5a4a3f; font-size:16px; padding-top:5px; padding-bottom:15px;">
            "${lema}"
          </td>
        </tr>

        <!-- SEPARADOR -->
        <tr>
          <td style="padding:10px 0;">
            <hr style="border:none; height:2px; background:#f3e2c4;">
          </td>
        </tr>

        <!-- TEXTO PRINCIPAL -->
        <tr>
          <td style="color:#483625; font-size:15px; line-height:22px; padding:10px 5px;">
            Es un gusto tenerte con nosotros. A partir de ahora recibirás ofertas exclusivas, noticias y contenido especial sobre nuestros productos artesanales elaborados con amor y dedicación.
          </td>
        </tr>

        <!-- CUPÓN -->
        <tr>
          <td align="center" style="padding:20px 0;">
            <div style="background:#fff3d4; padding:15px; border:2px dashed #d6a24a; border-radius:8px; max-width:300px;">
              <p style="margin:0; font-size:18px; color:#5a4a3f;">Tu cupón de bienvenida:</p>
              <h2 style="margin:8px 0 0 0; font-size:26px; color:#b2701b;">${cupon}</h2>
            </div>
          </td>
        </tr>

        <!-- BOTÓN -->
        <tr>
          <td align="center" style="padding-top:25px;">
            <a href="https://tutienda.com" 
              style="background:#5a4a3f; color:#ffffff; padding:12px 30px; text-decoration:none; font-size:17px; border-radius:6px;">
              🛒 Visitar tienda
            </a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" style="font-size:12px; color:#7a6a40; padding-top:30px;">
            © 2025 La Colmena — Todos los derechos reservados.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;


    await transporter.sendMail({
        //Nombre con el que ae envia el correo
        from: `"${empresa}" <${process.env.EMAIL_USER}>`,
        //destinatario
        to: email,
        //asunto
        subject: "🎉 ¡Bienvenido a La Colmena!",
        //cuerpo paltilla HTML del correo
        html: htmlMensaje,
        attachments: [
  {
    filename: "logo.png",
    path: __dirname + "/../media/lema.png", // <-- RUTA QUE USAS
    cid: "logoempresa" 
  }
]

    });

    res.json({ mensaje: "Suscripción realizada y correo enviado correctamente" });

  } catch (error) {
    console.error('Error en suscripcion:', error);
    res.status(500).json({ mensaje: 'Error al realizar la suscripcion' });
  }
};

module.exports = {
  suscribirUsuario
};