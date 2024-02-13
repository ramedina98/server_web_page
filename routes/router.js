//import the express module to create a router...
const express = require('express');
//create an instance of and Express router...
const router = express.Router();
//we import the necessary function from the controller/request.js
const crud = require('../controller/controller_porfolio.js');
/*this import module will hepls us to do the authentication, after having generated 
the token in the 'authController', the client obtains the signed token, and here 
it sends it every time it requires information from the api, we validate it and if it is 
correct the information is provided...*/
const authenticateToken = require('../middleware/authMiddleware.js');
/*This import module helps us to validate that the credentials to obtain
a token are correct, and if so, it will return a valid token for use
in the request of information through the apis...*/
const authController = require('../controller/authController.js');

/*Login: route to obtain the authentication token...*/
router.post('/login', authController.loginUser);

//GET

//TODO: podriamos tal vez crearle una vista con ejs...
router.get('/', (_req, res) => {
    res.send('¡Hola desde la raíz!');
});

//protected routes...
router.use(authenticateToken);

//This are for personal projects...
router.get('/personal_projects', crud.getPersonalProjects);
router.get('/personal_project/:id', crud.getPersonalProject);

//This are for work projects...
router.get('/work_projects', crud.getWorkProjects);
router.get('/work_project/:id', crud.getWorkProject);

//my resume...
router.get('/resume', crud.getResume);

//POST 

module.exports = router;
