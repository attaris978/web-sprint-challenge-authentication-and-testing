require('dotenv');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET || "shenanigans";

const generateToken = user => {
    const {id: subject, username} = user;
    const payload = {
        subject,
        username
    };
    const options = {
        expiresIn: '1d'
    
    };
    return jwt.sign(payload, secret, options);
    
}
module.exports = generateToken;