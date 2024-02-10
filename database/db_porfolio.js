//Here, we handle the connection to the database using the msql2 library...

//import the msql2 library...
const mysql = require('mysql2');

//create a connection with the provided configuration...
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, 
}).promise();

module.exports = pool;