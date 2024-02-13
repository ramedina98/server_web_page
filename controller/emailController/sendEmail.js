//Import the nodemailer library to sent emails...
const nodemailer = require('nodemailer');
//Import the HTML template function from the local file 'htmlTamplate.js'...
const htmlTamplate = require('./htmlTamplate.js');

//obtain the credentials from the enviroment variables...
const emailUsername = process.env.EMAIL; 
const emailPassword = process.env.PASS_EMAIL;

//configure  the email transport using nodemailer with the provided credentials...
const transporter = nodemailer.createTransport({
    host: process.env.HOST_EMAIL,
    port: process.env.PORT_EMAIL,
    secure: true, //indicate if the connection should use SSL.
    auth: {
        user: emailUsername,
        pass: emailPassword,
    },
});

//Define an asynchronous function to send an email...
const sendEmail = async (subject, data, html) => {
    //Desctructure the 'data' object to extract specific fields...
    const { name_person, email_person, message } = data;

    try{
        //use nodemailer to send an email with the provided options...
        await transporter.sendMail({
            from: process.env.EMAIL, //Sender's email address...
            to: html ? email_person : process.env.MY_EMAIL,//Recipient's email address...
            subject: subject, 
            html: html ? htmlTamplate(name_person, email_person) : undefined, //HTML content (conditional base on 'html' parameter)
            text: html ? undefined : `${name_person}: ${message}.\nCorreo del cliente: ${email_person}`, //Plain text content (conditional based on 'html' parameter)
        }); 

        //Return true to indicate the email was sent succesfully... 
        return true; 

    } catch(error){
        //Return false in case of an error while sending the email...
        return false;
    }
}

module.exports = sendEmail;