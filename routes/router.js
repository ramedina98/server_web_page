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

//NOTE: the following routes belong to the first phase of the project...

//This are for personal projects...
router.get('/personal_projects', crud.getPersonalProjects); // <-- however, it is used in the second phase
router.get('/personal_project/:id', crud.getPersonalProject); // <-- ALERT: define use in the second phase...

//This are for work projects...
router.get('/work_projects', crud.getWorkProjects); // <-- however, it is used in the second phase
router.get('/work_project/:id', crud.getWorkProject); //<-- ALERT: define use in the second phase...

//my resume...
router.get('/resume', crud.getResume);

//messages from potential customers...
router.post('/message_email', crud.postMessageEmails);

//NOTE: the following routes belong to the second phase...
/*
    TODO: 
        1. Emails. 
            - get -> done
            - delete -> done
        2. Tech. 
            - get -> done
            - post -> unstarted
            - put -> done
        3. trabjos. 
            - get -> unstarted
            - post -> unstarted
            - update -> unstarted
            - delete -> unstarted
        4. Experience. 
            - get -> unstarted
            - update -> unstarted
        5. resume_info. 
            - get -> unstarted
            - update -> unstarted
        6.Personal_info.
            - get -> unstarted
            - update -> unstarted
        7.
*/

/*EMAILS */
//we get all the data of the message_email table...
router.get('/emails', crud.getEmails); 

//Path to delete an email by its ID... 
router.delete('/delete_email/:id', crud.deleteEmails);

/*TECHNOLOGYS*/
//We get all the data of the tech table...
router.get('/technologys', crud.getTech);

//route to update the information of a technology...
router.put('/technology_update/:id', crud.putTech);

module.exports = router;
