//import the connection from the db.js file...
const connection = require('../database/db_porfolio');
//
const sendEmail = require('./emailController/sendEmail.js');

/*NOTE: 
The functions we see below belong to the first phase, wihch provides us with 
the necessary API's used in the front-end that the user sees...
*/

//SECTION: GET methods...

/*Here we get all the personal projects that are in the database... */
exports.getPersonalProjects = async (_req, res) => {
    try{
        const data = await connection.query(`SELECT pp.id AS project_id, pp.name_project, pp.description_project,
            pp.github_link, pp.web_link, i.link_img AS cover_image_text,
            GROUP_CONCAT(t.tec_name) AS technology_names, GROUP_CONCAT(t.icon_tec) AS technology_icons
        FROM
            personal_project pp
        LEFT JOIN
            image i ON pp.cover_img = i.id_img
        LEFT JOIN
            stack s ON pp.id = s.project_id
        LEFT JOIN
            technology t ON s.tech_id = t.id_tec
        GROUP BY
            pp.id;`);
        
        res.status(202).json({
            projects: data[0],
        });
        console.log('Resultados', data[0])
    } catch(err){
        res.status(500).json({
            message: err,
        })
    }
};

/*In the following function, we execute the necessary query to 
retrieve specific information about a project's blog. This 
includes details about the blog itself and the associated image carousel. 
This process is essential for obtaining comprehensive information when 
seeking more details about a particular project....*/

exports.getPersonalProject = async (req, res) => {
    //we have to extract the id to search for the specific project...
    const id = req.params.id; 

    try{
        const data = await connection.query(`SELECT
            b.id_blog AS blog_id,
            b.publication_date AS date,
            b.title AS blog_title,
            b.sub_text AS brief,
            b.main_img,
            pp.github_link AS github, 
            pp.web_link AS web,
            JSON_ARRAYAGG(DISTINCT JSON_OBJECT('icon_tec', t.icon_tec)) AS technology,
            JSON_ARRAYAGG(DISTINCT JSON_OBJECT('img_link', im.link_img)) AS img_carrusel,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'sub_text', sb.title_text,
                    'content', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'text', tc.text_blog, 
                                'type',tc.type_text
                            )
                        )
                        FROM text_cont_blog tc
                        WHERE tc.id_title = sb.id_subtitle
                    )
                )
            ) AS subt
        FROM
            blog b
        LEFT JOIN
            sub_title_blog sb ON b.id_blog = sb.id_blog
        LEFT JOIN
            img_carrusel_blog img ON b.id_blog = img.blog_id
        LEFT JOIN
            image im ON img.img_id = im.id_img
        LEFT JOIN 
            personal_project pp ON b.id_blog = pp.id_blog
        LEFT JOIN
            stack s ON pp.id = s.project_id
        LEFT JOIN
            technology t ON s.tech_id = t.id_tec
        WHERE
            b.id_blog = ?
        GROUP BY
            b.id_blog;`, [id]);

        //Function to clean the array of repeated elements...
        const cleanRepeatedElements = (array) => {
            //Array to keep track pf unique sub_text values...
            const uniqueSubText = [];
            //Array to store the result without duplicate sub_text...
            const resultArray = [];

            //iterate through each item in the input array...
            array.forEach(item => {
                //Extract the sub_text value from the current item...
                const subText = item.sub_text; 

                //check if the sub_text is not already in the uniqueSubText array...
                if(!uniqueSubText.includes(subText)){
                    //if not, add the sub_text to uniqueSubText and push the item to resultArray...
                    uniqueSubText.push(subText);
                    resultArray.push(item);
                }
            });

            //return the array without duplicate sub_text values...
            return resultArray;
        }

        //clear elements with null values...
        const cleanNullData = (array) => {
            // Array to store the result without null icon_tec values...
            const resultArray = [];
        
            // Iterate through each item in the input array...
            array.forEach(item => {
                // Extract the icon_tec value from the current item...
                const iconTec = item.icon_tec;
        
                // Check if the icon_tec is not null...
                if (iconTec !== null) {
                    // If not null, push the item to resultArray...
                    resultArray.push(item);
                }
            });
        
            // Return the array without null icon_tec values...
            return resultArray;
        };

        //parse the json data and clean the array of repeated elements...
        const subTitles = cleanRepeatedElements(JSON.parse(data[0][0].subt));
        //parse the json data and cleear elements with null values...
        const tecIcons = cleanNullData(JSON.parse(data[0][0].technology))
        
        //everything went well...
        res.status(202).json({
            blog_id: data[0][0].blog_id,
            date: data[0][0].date,
            blog_title: data[0][0].blog_title,
            brief: data[0][0].brief,
            topSectionImg: data[0][0].main_img,
            tec: tecIcons,
            img_carrusel: JSON.parse(data[0][0].img_carrusel),
            subT: subTitles,
            git: data[0][0].github, 
            web: data[0][0].web,
        });

    } catch(err){
        //if there is an error, we send a message...
        res.status(500).json({
            message:err, 
        })
    }
};

//Now here we start with the work prokects section...
//Firts we get all the projects...
exports.getWorkProjects = async (_req, res) => {
    try{
        const data = await connection.query(`SELECT wp.id_work, wp.work_project_name, wp.start_date, wp.end_date, wp.project_status, wp.link_project, im.link_img AS logo 
        FROM work_project wp
        JOIN image im ON wp.logo = im.id_img;`);

        res.status(202).json({
            works: data[0],
        }); 

    } catch(err){
        res.status(500).json({
            message:err,
        })
    }
};

/*then we search for a specific project with alll its data: 
1. description
2. paragraph
3. imgs 
this is to offer more information, to the person who is 
looking at my porfolio, about the specific project...*/

exports.getWorkProject = async (req, res) => {
    //we extract the id to search for the project...
    const id = req.params.id;

    try{
        const data = await connection.query(`
        SELECT wp.id_work, wp.work_project_name, wp.link_project,
        JSON_ARRAYAGG(im.link_img) AS img_carrusel,
        JSON_ARRAYAGG(p.text_p) AS description
        FROM work_project wp
        LEFT JOIN work_carrusel_img wci ON wp.id_work = wci.work_id
        LEFT JOIN image im ON wci.img_id = im.id_img
        LEFT JOIN description d ON wp.id_work = d.id_work
        LEFT JOIN paragraph p ON d.id_paragraph = p.id_p
        WHERE wp.id_work = ?
        GROUP BY wp.id_work;`, [id]);

        //Function to clean the array of repeated elements...
        const cleanRepeatedElements = (array) => {
            //Array to keep track pf unique sub_text values...
            const uniqueText = [];
            //Array to store the result without duplicate sub_text...
            const resultArray = [];

            //iterate through each item in the input array...
            array.forEach(item => {
                //Extract the sub_text value from the current item...
                const Text = item; 

                //check if the sub_text is not already in the uniqueSubText array...
                if(!uniqueText.includes(Text)){
                    //if not, add the sub_text to uniqueSubText and push the item to resultArray...
                    uniqueText.push(Text);
                    resultArray.push(item);
                }
            });

            //return the array without duplicate sub_text values...
            return resultArray;
        }

        const description = cleanRepeatedElements(JSON.parse(data[0][0].description))
        const imgs = cleanRepeatedElements(JSON.parse(data[0][0].img_carrusel));

        res.status(202).json({
            id_work: data[0][0].id_work,
            title: data[0][0].work_project_name,
            description: description,
            imgs: imgs,
            link_project: data[0][0].link_project,
        })

    } catch(err){
        res.status(500).json({
            message:err,
        })

    }
}

//The next part is: getting the information for my resume...
/*This query returns: 
1. my complete information 
2. the link to my pdf resume
3. my experiences (jobs and taskas perfomed)
4. technologies and tools I am proficent in*/
exports.getResume = async (_req, res) => {
    try{
        const data = await connection.query(`SELECT m.job_title, m.first_name AS nombre1,
            m.second_name AS nombre2, m.paternal_surname AS apellido1, m.maternal_surname AS apellido2,
            l.country, l.state, l.city, m.email, m.phone, r.link_pdf, ri.description_resume,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'tec_name', tec.tec_name,
                        'type_tec', tec.type_tec
                    )
                )
                FROM techno_resume tr
                JOIN technology tec ON tr.id_tec = tec.id_tec
                WHERE tr.id_resume = r.id_resume
            ) AS technology_info,
            e.description_exp,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'job', j.company_name,
                    'position', j.position_job,
                    'start_date', j.start_date,
                    'end_date', j.end_date,
                    'tasks', tasks.task_info
                )
            ) AS job_info
        FROM
            my_resume r
        JOIN
            resume_information ri ON r.information = ri.id_info
        JOIN
            me m ON ri.my_information = m.id
        JOIN
            location l ON m.location = l.id_l
        JOIN
            experience e ON ri.experience = e.id_e
        LEFT JOIN
            job j ON e.id_e = j.id_experience
        LEFT JOIN (
            SELECT
                id_job,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'text', text_task
                    )
                ) AS task_info
            FROM
                task_performed
            GROUP BY
                id_job
        ) AS tasks ON j.id_job = tasks.id_job
        GROUP BY
            m.job_title,
            m.first_name,
            m.second_name,
            m.paternal_surname,
            m.maternal_surname,
            l.country,
            l.state,
            l.city,
            m.email,
            m.phone,
            r.link_pdf,
            ri.description_resume,
            e.description_exp;`);

        res.status(202).json({
            nombre1: data[0][0].nombre1,
            nombre2: data[0][0].nombre2, 
            apellido1: data[0][0].apellido1, 
            apellido2: data[0][0].apellido2,
            job_title: data[0][0].job_title,
            country: data[0][0].country, 
            state: data[0][0].state,
            city: data[0][0].city,
            phone: data[0][0].phone, 
            email: data[0][0].email,
            link_pdf: data[0][0].link_pdf,
            description_resume: data[0][0].description_resume,
            description_exp: data[0][0].description_exp,
            job_info: JSON.parse(data[0][0].job_info),
            technology_info: JSON.parse(data[0][0].technology_info),
        }); 

    } catch(err){
        res.status(500).json({
            message: err,
        }); 
    }
};

//SECTION: POST methods...

/*on the client's side is a contact form, here we save the data: name, email and
message; this to maybe later be in contact with the potential clients and check if
in the future a service is offered...

In general terms, this is the most complex function: 

1. It must collect the information and store it in the db
2. Send an email to the client thanking her/him for contacting me and that
I will reply soon (tample HTML)
3. Send an email to me to alert me that a customer contacted me (obviously with the
message and the customer's email address)
*/
exports.postMessageEmails = async (req, res) => {
    try{
        //Extract specific fields from the request body...
        const { name, email, message } = req.body;

        //we validate the data...
        if(!name || !email || !message){
            //we return a status of 400 to indicate that there is an error...
            return res.status(400).json({
                error: 'Invalid data. Please provide all requiered fiels', 
            })
        }

        //Create the SQL query to insert data into the 'message_email' table...
        const sql = 'INSERT INTO message_email (name_person, email_person, message) VALUES (?,?,?)';

        //Execute the query...
        const result = await connection.query(sql, [name, email, message]); 
        
        //customer email
        const customerEmail = await sendEmail('Thank you for contacting Ricardo Medina Dev', req.body, true);

        //email to me...
        const emailtome = await sendEmail('Potential customer', req.body, false);

        /*we return a status 202 with several messages to indicate that everything
        want perfectly...*/
        res.status(202).json({
            message: 'Data successfully saved: ', result, 
            customer: customerEmail, 
            emailtome: emailtome,
        });

        

    } catch(err){ // Handle errors

        //we return a status of 500 to indicate that there was a server error...
        res.status(500).json({ 
            error: 'Internal Server Error', 
            message: err.message,
        });
    }
}


/*NOTE: 
    The following functions belong to the second phase of this project. With them we create the 
    necessary API's to use the necessary information in the ADMINISTRATOR APP of my porfolio web page...
*/

/*TODO: 
    1. Emails. 
        - get -> done
        - delete -> done
    2. Tech. 
        - get -> done
        - post -> done
        - put -> done
    3. trabajos. 
        - get -> done --> checar más adelante...
        - post -> done
        - update -> done
        - delete -> done
    4. Experience. 
        - get -> done
        - update -> done
    5. resume_info. 
        - get -> unstarted
        - update -> unstarted
    6.Personal_info.
        - get -> unstarted
        - update -> unstarted
    7. 
*/

/*EMAILS: here we have the email, get and delete controller functions...*/

//1. GET...
exports.getEmails = async(_req, res) => {
    try{
        //we obtain the data with the following query...
        const data = await connection.query('SELECT * FROM message_email;');

        //check if the array is empty...
        if(data.length === 0){
            return res.status(404).json({
                message: 'No emails found',
            });
        }

        // if it is not empty... 
        // Map over the array to transform each email object into desired format...
        const emails = data[0].map(email => ({
            id: email.id,
            name: email.name_person,
            email_address: email.email_person,
            message: email.message
        }));

        // send the emails as a JSON response with status code 202 (accepted)
        res.status(200).json(emails);

    } catch(error){
        res.status(500).json({
            message: error,
        }); 
    }
}

//2. DELETE...
exports.deleteEmails = async(req, res) => {
    try{
        // Extract the ID from the request parameter...
        const { id } = req.params;

        //execute the DELETE query... 
        await connection.query('DELETE FROM message_email WHERE id = ?', [id]);

        // Response with a success message... 
        res.status(204).json({
            message: 'Email successfully deleted'
        }); 

    } catch(error){
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error deleting email', 
            error: error.message,
        })
    }
}

/*TECHNOLOGY: here we have the tech, get, post, update controller functions...*/

//1. GET: all the data...
exports.getTech = async(_req, res) => {
    try {
        //we obtain the data with the following query...
        const data = await connection.query('SELECT * FROM technology;');

        //check if the array is empty...
        if(data.length === 0){
            return res.status(404).json({
                message: 'No tech found',
            }) 
        }

        // Map over the array to transform each email object into desired format...
        const techs = data[0].map(tech => ({
            id: tech.id_tec, 
            name: tech.tec_name, 
            icon: tech.icon_tec, 
            type: tech.type_tec,
        }));

        // send the emails as a JSON response with status code 202 (accepted)
        res.status(200).json(techs);

    } catch (error) {
        // handle any error...
        res.status(500).json({
            message: error,
        }); 
    }
}

//2. POST: adding new technologies...
exports.postTech = async(req, res) => {
    try {
        // Extrac the data sent in the body...
        const { name, icon, type } = req.body; 

        //Execute the query...
        await connection.query(`INSERT INTO technology (tec_name, icon_tec, type_tec) 
                                VALUES (?, ?, ?)`, [name, icon, type]); 
        
        // if the insertion is successful, send a sucess response to the client...
        res.status(201).json({
            message: 'Technology added successfully', 
        })

    } catch (error) {
        // if an error accurs during the insertion handle it and send an error response...
        res.status(500).json({
            message: 'Internal server error',
        })
    }
}

//3. PUT: updating data of any technology...
exports.putTech = async(req, res) => {
    try {
        // Extract the tec name, icon and type from the request parameter...
        const { name, icon, type, id } = req.body;  

        //execute the query...
        await connection.query(`UPDATE technology 
                                SET tec_name = ?, icon_tec = ?, type_tec = ?
                                WHERE id_tec = ?`, [name, icon, type, id]);

        // Response with a success message... 
        res.status(200).json({
            message: 'Successfully updated',
        });

    } catch (error) {
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error updating technology', 
            error: error.message,
        })
    }
}

/*JOBS: here we have all the jobs, get, put, post, delete controller functions...*/

/*1. GET: we have to get the data from two tables
*/
exports.getJobs = async(_req, res) => {
    try {
        //create and execute the query...
        const data = await connection.query(`SELECT j.*, 
                                                (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'text', t.text_task))
                                                FROM task_performed t 
                                                WHERE t.id_job = j.id_job) AS tasksPerformed
                                            FROM job j;`); 

        // Check if there is data in the table...
        if(data.length === 0){
            return res.status(404).json({
                message: 'Jobs not found', 
            });
        }

        // If it is not empty, we map the information and shape the json elements...
        const jobs = data[0].map(row => ({
            id_job: row.id_job,
            description_job: row.description_job,
            company_name: row.company_name,
            position_job: row.position_job,
            start_date: row.start_date,
            end_date: row.end_date,
            task: row.tasksPerformed ? JSON.parse(row.tasksPerformed) : [] // Parse the tasksPerformed JSON string
        }));

        // Send the emails as a JSON response with status code 202 (accepted)
        res.status(200).json(jobs);

    } catch (error) {
        // handle any error...
        res.status(500).json({
            message: error,
        });
    }
}

/*2. POST: whe adding new jobs, we have to add the requered information for the job table 
    and tasks performed, which will be added in the task_performed table...
*/
exports.postJob = async(req, res) => {
    try {
        //Extract data sent in the request body...
        const { description, company_name, position_job, start_date, end_date, tasks } = req.body; 

        // Execute the INSERT query to add the job
        const jobInserted = await connection.query(`INSERT INTO job (id_experience, description_job, company_name, position_job, start_date, end_date) 
        VALUES (?, ?, ?, ?, ?, ?)`, [1, description, company_name, position_job, start_date, end_date]);

        // Get the ID of the newly inserted job
        const jobId = jobInserted[0].insertId;

        // Execute a series of INSERT queries to add tasks associated with the job
        const tasksValues = tasks.map(task => [jobId, task.text]);
        await connection.query('INSERT INTO task_performed (id_job, text_task) VALUES ?', [tasksValues]);

        res.status(201).json({ 
            message: 'Job and tasks inserted successfully', 
        });

    } catch (error) {
        console.error('Error in postJobs function:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/*3. PUT: we make possible to update the data, but in this case they will be updated
    separately...

    - job table.
    - task table. 
*/

//updating a record in the job table...
exports.putJob = async(req, res) => {
    try {
        // Extract data sent in the request body...
        const { id, description, company_name, position_job, start_date, end_date } = req.body; 
        
        // Execute th query...
        await connection.query(`UPDATE job 
        SET description_job = ?, company_name = ?, position_job = ?, start_date = ?, end_date = ?
        WHERE id_job = ?`, [description, company_name, position_job, start_date, end_date, id]);

        // Response with a success message... 
        res.status(200).json({
            message: 'Successfully updated',
        });

    } catch (error) {
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error updating job', 
            error: error.message,
        });
    }
}

//updating a record in the task table...
exports.putTask = async(req, res) => {
    try {
        //Extract data sent in request body...
        const { id, text } = req.body;

        // Execute the query...
        await connection.query(`UPDATE task_performed 
        SET text_task = ?
        WHERE id = ?`, [text, id]); 

        res.status(200).json({
            message: 'Successfully updated'
        }); 

    } catch (error) {
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error updating task', 
            error: error.message,
        });
    }
}

/*4. DELETE: This is the next step, to be able to delete information from the two tables.
    First would be the records in the task table, records releted to job, and then the record
    in job table...
*/

exports.deleteJob = async(req, res) => {
    try {
        // Extracat id of the job sent in the request body...
        const { jobId } = req.body; 

        /*we run the query to delete information from the task table, 
        records releted to id_job...*/
        await connection.query('DELETE FROM task_performed WHERE id_job = ?', [jobId]);

        //now we delete the record in the job table related to id_job...
        await connection.query('DELETE FROM job WHERE id_job = ?', [jobId]); 

        // Response with a success message... 
        res.status(204).json({
            message: 'Job successfully deleted'
        }); 

    } catch (error) {
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error deleting job and its tasks', 
            error: error.message,
        });
    }
}

/*EXPERIENCE: here we have all the experience, get and put controller functions...*/

//GET
exports.getExperience = async(_req, res) => {
    try {
        // Execute the query...
        /*I only have one record in this table and it will always be like that, 
        so I only need the first one...
        */
        const data = await connection.query('SELECT * FROM experience WHERE id_e = ?', [1]);

        // If it is empty it sends a message...
        if(data.length === 0){
            return res.status(404).json({
                message: 'Nothing was found', 
            }); 
        }

        const experience = {
            text: data[0][0].description_exp, 
        }

        res.status(200).json(experience);

    } catch (error) {
        // handle any error...
        res.status(500).json({
            message: error,
        });
    }
}

//PUT: to edit the text column of the first and only record in the experience table...
exports.putExperience = async(req, res) => {
    try {
        //Extract data sent in the request body...
        const { text } = req.body; 

        // Execute the query...
        await connection.query(`UPDATE experience 
        SET description_exp = ?
        WHERE id_e = ?`, [text, 1]); 

        res.status(200).json({
            message: 'Successfully updated'
        }); 

    } catch (error) {
        //handle any error that may occur...
        res.status(500).json({
            message: 'Error updating experience', 
            error: error.message,
        });
    }
}