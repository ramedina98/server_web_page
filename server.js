/*TODO: 
    Empezaremos los trabajos para crear los nuevos endpoints. Los cuales 
    nos ayudaran a crear las APIS que sera usadas en la aplicación de administración
    de mi pagina web...

    cosas a tener en cuenta: 
    
    1. cambiar este script al momento de terminar todo : "start": "nodemon ./server.js" --> "start": "node ./server.js"
    2. Crear la vista con ejs para la raiz del proyecto...
    3. Crear la HTML template para los emails...
*/

//Load enviroment variables from the .env file
require('dotenv').config();

//Import the express library...
const express = require('express');
//import cors middleware... 
const cors = require('cors');

//create an instance of the Express application...
const app = express();

//Enable express.json() middleware to parse JSON-formatted request body...
app.use(express.json());

// Enable CORS middleware for corss-origin requests...
app.use(cors());

//Import the router from the router.js file...
const router = require('./routes/router.js');

//Associate the router with the root ('/') path of the application...
app.use('/', router);

//Get the port number from enviroment variable or use the default port
const PORT = process.env.PORT || 3000;

//start the server and listen on the specified port...
//hola
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})