const JWT = require('jsonwebtoken');

async function autentication(req, res, next) {
    console.log(req.cookies.token);
    if(!req.cookies.token) {
        return res.redirect('/grancvel/login');
    }

    const verifyToken = await JWT.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    req.user = verifyToken;
    next();
}

module.exports = autentication;