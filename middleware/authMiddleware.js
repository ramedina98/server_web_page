const jwt = require('jsonwebtoken');

/*this function will hepls us to do the authentication, after having generated 
the token in the 'authController', the client obtains the signed token, and here 
it sends it every time it requires information from the api, we validate it and if it is 
correct the information is provided...*/
function authenticateToken(req, res, next){
    
    //Extract authorization header from the incoming request...
    const authHeader = req.header('Authorization');
    
    //Check if authorization header is missing or doesn't start with bearer...
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        //return a 401 unathorized response with an error message...
        return res.status(401).json({
            error: 'Access denied, token not provided',
        });
    }

    //extract the token by removing 'Bearer' from the authorization header... 
    const token = authHeader.slice(7);

    //verify the extracted token using the secret key... 
    jwt.verify(token, process.env.MY_SECRET_KEY, (err, user) => {

        //handle token verification errors...
        if(err){
            //Check if the error is due to token expiration...
            if(err.name === 'TokenExpiredError'){
                //Return a 401 unauthorized response with a token expiration error message...
                return res.status(401).json({
                    error: 'Token Expired',
                })
            }

            //Return a 403 Forbidden response with an invalid token error message...
            return res.status(403).json({
                error: 'Invalid token',
            })
        }

        //Attach the decoded user information to the response object...
        res.user = user; 
        //call the next middleware or route handler in the chain...
        next(); 
    })
}

module.exports = authenticateToken;