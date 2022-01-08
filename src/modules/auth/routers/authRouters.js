const express = require('express');

const AuthenticateToken = require('../../../middleware/authenticateToken');
const AuthController = require('../controllers/authController');

class authRouter {
    static getRouter() {

        const Router = express.Router();
    
        Router.post('/', AuthController.auth);                                                                      //AUTHENTICATE USER
        Router.delete('/logout', AuthenticateToken, AuthController.logout);                                         //LOGOUT USER
        Router.post('/refreshToken', AuthenticateToken, AuthController.refreshToken);                               //REFRESH TOKEN
        //Router.post('/auth/forgot' , AuthController.forgot);                                                      //FORGOT PASSWORD
        //Router.get('/auth/forgot' , AuthController.alterPassword);  
    
        return Router
    }
}

module.exports = authRouter.getRouter();