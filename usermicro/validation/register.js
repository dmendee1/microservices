const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
    let errors = {};
    data.lastname = !isEmpty(data.lastname) ? data.lastname : '';
    data.firstname = !isEmpty(data.firstname) ? data.firstname : '';
    data.username = !isEmpty(data.username) ? data.username : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    
    return {
        errors,
        isValid: isEmpty(errors)
    }
}