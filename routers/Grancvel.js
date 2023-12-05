const express = require('express');
const router = express.Router();
const JWT = require('jsonwebtoken');
const DB = require('../DB/Database');
const bcrypt = require('bcrypt');

router.get('/register', isAtenticate, (req, res) => {
    res.render('register.ejs',{
        emailValid: true
    })
})
async function mailValidation(req, res, next) {
    const { email } = req.body;
    const thisUserEmail = await DB.query('select email from users where email = ?', [email])
    if(thisUserEmail[0].length !== 0) {
        return res.render('register.ejs', {
            emailValid: false
        });
    }
    next();
}
function isAtenticate(req, res, next) {
    if(req.cookies.token !== undefined) {
        return res.redirect('/');
    }

    next();
}
router.post('/register', mailValidation, async (req, res) => {
    const { name, email, password } = req.body;
    const hashPassword = await bcrypt.hash(password, 10);
    const token = JWT.sign({name, email}, process.env.JWT_SECRET_KEY);

    await DB.query('insert into users(name, email, password, token) values(?, ?, ?, ?);', [name, email, hashPassword, token]);
    res.redirect('/grancvel/login');
    // console.log('cookies - ' + req.cookies)
    // req.cookies.token = token;
})

router.get('/login', isAtenticate, (req, res) => {
    res.render('login.ejs',)
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [findUser] = await DB.query('select * from users where email=?', [email]);

    if(findUser.length !== 0) {
        const passwordValid = await bcrypt.compare(password, findUser[0].password);
        
        if(passwordValid) {
            console.log(findUser)
            console.log({id: findUser[0].id, name: findUser[0].name, email: findUser[0].email});
            const token = JWT.sign({id: findUser[0].id, name: findUser[0].name, email: findUser[0].email}, process.env.JWT_SECRET_KEY);
            res.cookie('token', token);
            return res.redirect('/home');
        }
    }
    res.render('login.ejs',)
})


module.exports = router;