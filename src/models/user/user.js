const Model = require('../Model');
const knex = require('../../config/database');
const util = require('../util/util');
const { v4: uuidv4 } = require('uuid');
const Mail = require('../../services/Mail');

class User extends Model{
    
    constructor(){
        super()
    }

    async create(data){
        try {
            const email = data.email.toLowerCase();
            const emailWasRegistered = await knex('users').where('email', email);
            if(emailWasRegistered.length > 0){
                return {status: false, message: 'Email já registrado', field: 'email'};
            }else{
                const id = await util.createId("idUser "+email);
                const password = await util.encriptPassword(data.password);
                const user = await knex('users').insert({...data, id, email, password}).then(() => {return knex ('users').where('email', email).select('email')});
                //const mail = new Mail("DevTube <transational@devtube.io>", "Welcome to DevTube", `Olá ${this.fullname}, Seja Bem Vindo ao <b>DevTube</b> !`);
                //await mail.send()
                const code = uuidv4();
                const userId = {id: user.id, code: code};
                const token = util.generateToken()

                return {status: true, user: user[0]};
            }
        } catch (error) {
            return {status: false, message: error.message};
        }
    }

    async getUser(id)
    {
        try {
            const user = await knex('users').where(id, ['id', 'email', 'fullname', 'birth', 'nickname', 'type', 'active', 'created_at', 'updated_at']);
            if (user[0].active == 1) {
                return user[0];
            }else{
                return {status: false, message: 'Usuário não está ativo'};
            }
        } catch (error) {
            return {status: false, message: error.message};
        }
    }

    /*
    async find(email, password){
        try {
            const user = knex('users').where({email});
            if(!user){
                throw new Error('E-Mail Not Found !');
            }
            const comparePassword = this.comparePassword(password, user.password);
            if(!comparePassword){
                throw new Error('Incorrect Password !');
            }
            return true;
        } catch (error) {
            throw new Error('Erro ao procurar e-mail');
        }
    }*/
    
}

module.exports = User