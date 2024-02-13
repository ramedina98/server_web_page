//TODO: falta hacer el post del formulario de contacto...

//import the connection from the db.js file...
const connection = require('../database/db_porfolio');
//
const sendEmail = require('./emailController/sendEmail.js');


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
            b.title AS blog_title,
            GROUP_CONCAT(im.link_img) AS img_carrusel,
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
        WHERE
            b.id_blog = ?
        GROUP BY
            b.id_blog;`, [id]);
        
        //everything went well...
        res.status(202).json({
            personal_project_blog: data[0],
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
        GROUP_CONCAT(im.link_img) AS img_carrusel,
        GROUP_CONCAT(p.text_p) AS description
        FROM work_project wp
        LEFT JOIN work_carrusel_img wci ON wp.id_work = wci.work_id
        LEFT JOIN image im ON wci.img_id = im.id_img
        LEFT JOIN description d ON wp.id_work = d.id_work
        LEFT JOIN paragraph p ON d.id_paragraph = p.id_p
        WHERE wp.id_work = ?
        GROUP BY wp.id_work;`, [id]);

        res.status(202).json({
            work_project_blog: data[0],
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
            resume: data[0],
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
        const { name_person, email_person, message } = req.body;

        //we validate the data...
        if(!name_person || !email_person || !message){
            //we return a status of 400 to indicate that there is an error...
            return res.status(400).json({
                error: 'Invalid data. Please provide all requiered fiels', 
            })
        }

        //Create the SQL query to insert data into the 'message_email' table...
        const sql = 'INSERT INTO message_email (name_person, email_person, message) VALUES (?,?,?)';

        //Execute the query...
        const result = await connection.query(sql, [name_person, email_person, message]); 
        connection.end(); //we close the connection...

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