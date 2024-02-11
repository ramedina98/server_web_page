//import the express module to create a router...
const express = require('express');
//create an instance of and Express router...
const router = express.Router();
//we import the necessary function from the controller/request.js
const crud = require('../controller/controller_porfolio.js');

//GET requests...

//TODO: podriamos tal vez crearle una vista con ejs...
router.get('/', (req, res) => {
    res.send('¡Hola desde la raíz!');
});

//This are for personal projects...
router.get('/personal_projects', crud.getPersonalProjects);
router.get('/personal_project/:id', crud.getPersonalProject);

//This are for work projects...
router.get('/work_projects', crud.getWorkProjects);
router.get('/work_project/:id', crud.getWorkProject);

//my resume...
router.get('/resume', crud.getResume);

module.exports = router;
