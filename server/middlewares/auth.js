const { User } = require('../models/user');

let auth = (req, res ,next)=>{
    let token = req.cookies.auth;

    User.findByToken(token, (error, user)=>{
        if(error) throw(error);

        if(!user) return res.json({
            error:true
        });

        req.token = token;
        req.user = user;
        next();
    });
};

module.exports = { auth };