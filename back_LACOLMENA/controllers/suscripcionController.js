const nodemailer = require("nodemailer");

exports.suscribir = async (req, res) => {
    const { email, cupon } = req.body;

    try {
        // Configurar el transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "marcos24@gmail.com", 
                pass: "1234" 
            }
        });

        // Contenido del Email
        const mensajeHTML = `
            <h2>¡Bienvenido a La Colmena!</h2>
            <p>Tu cupón es:</p>
            <h1>${cupon}</h1>
        `;

        await transporter.sendMail({
            from: "La Colmena <marcos24@gmail.com>",
            to: email,
            subject: "🎟 Tu Cupón de Bienvenida - La Colmena",
            html: mensajeHTML
        });

        res.json({ ok: true, mensaje: "Correo enviado correctamente" });

    } catch (error) {
        console.log("Error al enviar correo:", error);
        res.status(500).json({ ok: false, error: "Error al enviar correo" });
    }
};
