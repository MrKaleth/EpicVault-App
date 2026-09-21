const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'epicvault.system@gmail.com',
        pass: 'ynpc nmaz xwuv sdui'
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password_hash } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.password_hash !== password_hash) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        if (!user.verified) {
            return res.status(403).json({ message: 'Aún no has verificado tu cuenta. Revisa tu correo electrónico.' });
        }

        user.last_login = new Date();
        await user.save();

        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password_hash } = req.body;

        const existe = await User.findOne({ email: email });
        if (existe) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        const tokenSecreto = crypto.randomBytes(20).toString('hex');


        const prefijo = username.substring(0, 4).toUpperCase().replace(/\s/g, '');
        const sufijoAleatorio = Math.floor(1000 + Math.random() * 9000);
        let nuevoFriendCode = `${prefijo}#${sufijoAleatorio}`;

        let codigoExiste = await User.findOne({ friend_code: nuevoFriendCode });
        while (codigoExiste) {
            const nuevoSufijo = Math.floor(1000 + Math.random() * 9000);
            nuevoFriendCode = `${prefijo}#${nuevoSufijo}`;
            codigoExiste = await User.findOne({ friend_code: nuevoFriendCode });
        }

        const nuevoUsuario = new User({
            username: req.body.username,
            email: req.body.email,
            password_hash: req.body.password_hash,
            verified: false,
            verification_token: tokenSecreto,
            friend_code: nuevoFriendCode,
            global_roles: ['USER'],
            created_at: new Date()
        });

        await nuevoUsuario.save();

        const urlVerificacion = `http://localhost:4000/api/verificar/${tokenSecreto}`;

        const mailOptions = {
            from: '"EpicVault System" <epicvault.system@gmail.com>',
            to: nuevoUsuario.email,
            subject: '⚔️ Verifica tu cuenta para entrar a EpicVault',
            html: `
                <div style="font-family: 'Exo 2', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; text-align: center; background-color: #1a141f; color: #f8fafc; border: 1px solid rgba(139, 238, 255, 0.1); border-radius: 15px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);">
                    <div style="background-color: #29222F; padding: 20px; border-radius: 10px; border: 1px solid rgba(139, 238, 255, 0.1);">
                        <h2 style="color: #8BEEFF; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">¡Saludos, aventurero ${nuevoUsuario.username}! 🐉</h2>
                        <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5;">Has solicitado forjar una cuenta en la Bóveda. Para poder unirte a las campañas y lanzar los dados, primero debes demostrar que eres quien dices ser.</p>
                        
                        <a href="${urlVerificacion}" style="display: inline-block; background-color: #d946ef; color: #ffffff; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; margin: 25px 0; font-size: 18px; text-transform: uppercase; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">🗡️ Abrir la Bóveda</a>
                        
                        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.05); margin: 20px 0;">
                        
                        <p style="color: #64748b; font-size: 12px;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="${urlVerificacion}" style="color: #8BEEFF; word-break: break-all;">${urlVerificacion}</a></p>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions).catch(err => console.error('Error enviando el correo:', err));

        res.status(201).json({ message: 'Usuario creado. Revisa tu correo para verificar tu cuenta.', user: nuevoUsuario });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
});

router.get('/verificar/:token', async (req, res) => {
    try {
        const token = req.params.token;

        const user = await User.findOne({ verification_token: token });

        if (!user) {
            return res.status(400).send(`
                <body style="background-color: #1a141f; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Exo 2', sans-serif;">
                    <div style="background-color: #29222F; padding: 50px; text-align: center; border-radius: 15px; border: 1px solid rgba(139, 238, 255, 0.1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); max-width: 500px;">
                        <h1 style="color: #ff4d4d; text-transform: uppercase; margin-top: 0;">❌ Enlace Inválido</h1>
                        <p style="color: #cbd5e1; font-size: 18px;">El pergamino ha caducado o la cuenta ya fue verificada.</p>
                        <a href="http://localhost:4200/login" style="display: inline-block; margin-top: 20px; background-color: #8BEEFF; color: #1a141f; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; text-transform: uppercase;">Volver a la Posada</a>
                    </div>
                </body>
            `);
        }

        user.verified = true;
        user.verification_token = undefined;
        await user.save();

        res.send(`
            <body style="background-color: #1a141f; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: 'Exo 2', sans-serif;">
                <div style="background-color: #29222F; padding: 50px; text-align: center; border-radius: 15px; border: 1px solid rgba(139, 238, 255, 0.1); box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5); max-width: 500px;">
                    <h1 style="color: #8BEEFF; text-transform: uppercase; margin-top: 0; letter-spacing: 1px;">¡Misión Completada! 🛡️</h1>
                    <p style="color: #cbd5e1; font-size: 18px;">Tu cuenta ha sido verificada con éxito. Ya eres miembro oficial de EpicVault.</p>
                    <br>
                    <a href="http://localhost:4200/login" style="display: inline-block; background-color: #d946ef; color: #ffffff; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px; font-size: 18px; text-transform: uppercase; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">Ir a Iniciar Sesión</a>
                </div>
            </body>
        `);

    } catch (error) {
        console.error(error);
        res.status(500).send('<body style="background-color: #1a141f; color: #ff4d4d; text-align: center; padding-top: 50px; font-family: sans-serif;"><h1>Error interno del servidor al verificar.</h1></body>');
    }
});

// El PUT para actualizar que ya tenías
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const userActualizado = await User.findByIdAndUpdate(id, body, { new: true });
        if (!userActualizado) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: 'Perfil actualizado con éxito', user: userActualizado });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar' });
    }
});

module.exports = router;