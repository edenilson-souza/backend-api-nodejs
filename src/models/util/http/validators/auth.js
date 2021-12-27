const Validator = require('../Validator')

const schema = {
    async auth(){
        Validator.object().shape({
            email: Validator.string().required().email(),
            password: Validator.string().required().min(8)
        });
    }
}

module.exports = schema