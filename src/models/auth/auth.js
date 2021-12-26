const knex = require('../../config/database');
const Model = require('../Model');
const util = require('../util/util');

class Auth extends Model{

    async authenticate({email, password}) {
        const dbemail = await knex('users').where("email", email.toLowerCase());
        if (JSON.stringify(dbemail[0]) != undefined && JSON.stringify(dbemail[0]) != null){
            const dbpassword = dbemail[0].password;
            const comparePassword = await util.comparePassword(password, dbpassword);
            if(comparePassword === true){             
                return ({id: dbemail[0].id, updated_at: dbemail[0].updated_at});
            }
            else{
                return false;
            }
        } else{
            return false;
        }   
    }

    async login({id, updated_at}){
        const dbemail = await knex('users').where("id", id).select('email', 'fullname', 'birth', 'nickname', 'type', 'updated_at');
        if(JSON.stringify(updated_at) === JSON.stringify(dbemail[0].updated_at)){
            return dbemail[0];
        }else{
            return false;
        }   
    }

    async logout({id, token}){
        const dbToken = await knex('users').where("id", id).select("refresh_token");
        if(token === dbToken[0].refresh_token){
            await knex('users').where("id", id).update("refresh_token", null);
            return true;
        }else{
            return false;
        }
      
    }

    async refreshToken ({id, updated_at, token}){
        const dbToken = await knex('users').where("id", id).select("refresh_token" , "updated_at");
        if(token === dbToken[0].refresh_token && JSON.stringify(updated_at) === JSON.stringify(dbToken[0].updated_at)){
            return true;
        }else{
            return false;
        }
    }

    async refreshToken_Update(id, refreshToken){
        await knex('users').where("id", id.id).where("updated_at", id.updated_at).update("refresh_token", refreshToken);
    }
}

module.exports = Auth