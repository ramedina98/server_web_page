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
            - post -> done
            - put -> done
        3. trabajos. 
            - get -> done
            - post -> done
            - update -> done
            - delete -> done
        4. Experience. 
            - get -> done
            - update -> done
        5. resume_info. 
            - get -> done
            - update -> done
        6.Personal_info.
            - get -> done
            - update -> done
        7.Personal projects... 
        8.Work projects...
*/

/*EMAILS */
//we get all the data of the message_email table...
router.get('/emails', crud.getEmails); 

//Path to delete an email by its ID... 
router.delete('/delete_email/:id', crud.deleteEmails);

/*TECHNOLOGYS*/
//We get all the data of the tech table...
router.get('/technologies', crud.getTech);

//route to add new technologies to the table...
router.post('/new_technology', crud.postTech);

//route to update the information of a technology...
router.put('/update_technology', crud.putTech);

/*JOBS*/
//route to get all the data in job and task_performed tables...
router.get('/jobs', crud.getJobs);

//route to insert information about another job...
router.post('/new_job', crud.postJob);

//route to update information about a job...
router.put('/update_job', crud.putJob);

//route to update information about a task...
router.put('/update_task', crud.putTask);

//route to delete infromation about a job an its tasks...
router.delete('/delete_job', crud.deleteJob);

/*EXPERIENCE*/
//route to get the only record in the experience table...
router.get('/experience', crud.getExperience);

//route to update the description column...
router.put('/update_experience', crud.putExperience);

/*RESUME INFO*/
//route to GET only the info of description_info column... 
router.get('/resume_info', crud.getResumeInfo);

//PUT:route to update only the info of description_info column...
router.put('/update_resume_info', crud.putResumeInfo);

/*INFO*/
//GET
router.get('/me', crud.getPersonalInfo);

//PUT...
router.put('/update_me', crud.putPersonalInfo);

module.exports = router;