const nodemailer = require("nodemailer");
const contactoModel = require("../model/contactoModel");

//manda correo en la seccion contactos
async function enviarMensaje(req, res) {
  try {
    const { nombre, email, mensaje } = req.body;

    // Validación
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Guardar en BD
    await contactoModel.crearContacto(nombre, email, mensaje);

    // Crear transporter local
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,     // tu correo
        pass: process.env.EMAIL_PASS      // tu contraseña de aplicacion
      }
    });

    //plantilla html

    const empresa = "La Colmena";    
    const lema = "Cuando tu día sea amargo, agrégale miel ";

    const htmlContacto = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff; padding:20px 0; font-family: Arial, sans-serif;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; border:1px solid #e5d7c7; padding:20px;">

            <tr>
              <td align="center" style="padding-bottom: 15px;">
                <img src="cid:logoempresa" style="width:100%; max-width:600px; border-radius:10px;" />
              </td>
            </tr>

            <tr>
              <td align="center" style="color:#483625; font-size:26px; font-weight:bold; padding-top:10px;">
                ¡Gracias por contactarnos!
              </td>
            </tr>

            <tr>
              <td align="center" style="color:#5a4a3f; font-size:16px; padding-top:5px; padding-bottom:15px;">
                "${lema}"
              </td>
            </tr>

            <tr>
              <td style="padding:10px 0;">
                <hr style="border:none; height:2px; background:#f3e2c4;">
              </td>
            </tr>

            <tr>
              <td style="color:#483625; font-size:15px; line-height:22px; padding:10px 5px;">
                Hola <strong>${nombre}</strong>,<br><br>
                Hemos recibido tu mensaje y nuestro equipo ya está revisándolo.<br><br>
                <strong>En breve será atendido.</strong><br><br>
                Gracias por confiar en <strong>La Colmena</strong>.
              </td>
            </tr>

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

    // Enviar correo
    await transporter.sendMail({
      from: `"${empresa}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "📩 Hemos recibido tu mensaje",
      html: htmlContacto,
      attachments: [
        {
          filename: "logo.png",
          path: __dirname + "/../media/lema.png",
          cid: "logoempresa"
        }
      ]
    });

    res.status(200).json({ message: "Mensaje recibido y correo enviado" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al procesar el contacto" });
  }
}

module.exports = { enviarMensaje };