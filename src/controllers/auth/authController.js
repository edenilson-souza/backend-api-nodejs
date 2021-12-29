const AuthValidator = require('../../modules/http/validators/auth');
const Auth = require('../../models/auth/auth');
const util = require('../../modules/util/util');
const { v4: uuidv4 } = require('uuid');
const Mail = require('../../services/mail');

module.exports = {
    
    async auth(req, res){
        const data = req.body;
        AuthValidator.auth.validate({...data}).then(async function (valid)
            {
                try 
                {
                    const modelUser = new Auth();
                    const user = await modelUser.authenticate(data);
                    if(user.status){
                        const idToken = uuidv4();
                        const userId = {id: user.message.id, code: idToken};
                        const accessToken = await util.generateToken(userId, process.env.ACCESS_TOKEN_SECRET, '15m');
                        const refreshToken = await util.generateToken(userId, process.env.REFRESH_TOKEN_SECRET, '7d');
                        res.json({status: true, accessToken: accessToken, refreshToken: refreshToken });
                    }else{
                        res.status(403).json({status: false, message: 'E-mail e/ou senha estão incorretos.'}) ;
                    }
                }   
                catch (error) {
                    res.status(500).json({status: false, message: error.message });
                }
            }
        ).catch(function (err) 
        {
            res.status(500).json({status: false, message: err.errors[0], field: err.path});
        });
    },
    
    /*async login(req, res){
        try {
            const data = req.tokenData;
            const modelUser = new Auth();
            const user = await modelUser.login(data);
            if(user.status){
                res.status(200).json({status: true, data: user.message});
            }else{
                res.sendStatus(403);
            }
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    },*/

    async logout(req, res){
        try{
            const modelUser = new Auth();
            const token = req.headers['access-token'];
            const result = await modelUser.logout(token);
            if (result.status){
                res.status(200).json({ auth: false, accessToken: null });
            }else{
                res.sendStatus(403);
            }
        }catch (error) {
           res.sendStatus(500);
        }
    },
    
    async refreshToken(req, res){
        try{            
            const tokenRefreshVerified = await util.verifyToken(req.body.refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if(tokenRefreshVerified){
                if (tokenRefreshVerified.code == req.tokenData.code){
                    const modelUser = new Auth();
                    const tokenForLogout = req.headers['access-token'];
                    const result = await modelUser.logout(tokenForLogout);
                    const accessToken = await util.generateToken({id:req.tokenData.id, code:tokenRefreshVerified.code}, process.env.ACCESS_TOKEN_SECRET, '15m');
                    if (result.status){
                        res.status(200).json({ accessToken: accessToken });
                    }
                }else{
                    res.sendStatus(403);
                }
            }else{
                res.sendStatus(403);
            }
        }catch (error) {
           res.sendStatus(500);
        }
    },

   /* async forgot(req, res){
        const {email} = req.body;
        try {
            const userModel = new User();
            const verifyEmail = await userModel.where({email}, ['email']);
            if(verifyEmail.length >= 1){
                generateAndSentPasswordRecovery(email);
                return res.status(200).json({message: 'Verifique seu e-mail'});
            }else{
                return res.status(500).json({message: 'E-mail não encontrado', field: 'email'});
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
            
        }
    },

    async alterPassword(req, res){
        const {email, recovery_code, newPassword} = req.query;
        try {
            const userModel = new User();
            const checkCode = await userModel.where({email, recovery_code}, ['id']);
            if(checkCode.length >= 1){
                const encriptNewPassword = await userModel.encriptPassword(newPassword);
                await userModel.update({email}, {password: encriptNewPassword});
                return res.status(200).json({message: 'Senha alterada com sucesso'});
            }else{
                return res.status(500).json({message: 'Código Inváido'});
            }
        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    },*/
}

/*
async function generateAndSentPasswordRecovery(email){
    try {
        const code = uuidv4();
        const userModel = new User();
        await userModel.update({email}, {'recovery_code': code});
        const user = await userModel.where({email}, ['fullname']);
        const mail = new Mail("DevTube <transational@devtube.io>", email,"Recuperação de Senha ", `Olá ${user[0].fullname}, clique <a href="http://localhost:3333/api/v1/auth/forgot?recovery_code=${code}&email=${email}" target="_blank">aqui</a> para refazer uma nova senha !`);
        await mail.send();
        return true;
    } catch (error) {
        throw new Error(error.message);
    }
}*/