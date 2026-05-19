const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/uploads', express.static('uploads'));

require('dotenv').config();

const port = process.env.PORT || 4000;
const mongoose = require('mongoose');

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.t5knlsf.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

mongoose.connect(uri)
    .then(() => console.log('Base de Datos Conectada 🚀'))
    .catch(e => console.log(e));

// --- RUTAS ---
app.use('/usuarios', require('./router/user'));
app.use('/api', require('./router/auth'));
app.use('/api/campanas', require('./router/campaign'));
app.use('/api/amigos', require('./router/friends'));
app.use('/api/notificaciones', require('./router/notification'));
app.use('/api/personajes', require('./router/character'));
app.use('/api/notas', require('./router/note'));

app.listen(port, () => {
    console.log(`Servidor EpicVault escuchando en http://localhost:${port} 📡`);
});