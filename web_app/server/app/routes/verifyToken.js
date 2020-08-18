const jwt = require('jsonwebtoken');

function authenticateJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send('Access Denied');

    try {
        const token = authHeader.split(' ')[1];
        const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user= verified;
        next();
    } catch(err) {
        res.status(400).send('Invalid Token');
    }
}