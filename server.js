//Load enviroment variables from the .env file
require('dotenv').config();

//Import the express library...
const express = require('express');

//create an instance of the Express application...
const app = express();

//Enable express.json() middleware to parse JSON-formatted request body...
app.use(express.json());

//Import the router from the router.js file...
const router = require('./routes/router.js');

//Associate the router with the root ('/') path of the application...
app.use('/', router);

//Get the port number from enviroment variable or use the default port
const PORT = process.env.SERVER_PORT || 3000;

//start the server and listen on the specified port...
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
})