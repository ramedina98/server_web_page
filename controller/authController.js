const jwt = require('jsonwebtoken');

/*This function helps us to validate that the credentials to obtain
a token are correct, and if so, it will return a valid token for use
in the request of information through the apis...*/
function loginUser(req, res){
    //we extract the credentials sent for the validation... 
    const credentials = req.body;
    
    //if the user is correct we generate a new token...
    if(credentials.username === process.env.USUARIO){
        
        const user = { id: 1, username: credentials.username };
        //generate a new token...
        const token = jwt.sign(user, process.env.MY_SECRET_KEY, { expiresIn: '1h'});

        //we return the token in a json...
        res.json({ token });
    } else{
        //we return an error message if the credentials are incorrect...
        res.json({ error: 'Incorrect credentials'});
    }
}

module.exports = { loginUser };