const { Schema, model } = require('mongoose')

const userSchema = Schema({
    useremail: { type: String, required: true, unique: true },
    user_id: { type: String, required: true, unique: true },
    oauth_token: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    first_name: String,
    last_name: String,
    user_image: String
})

const User = model('User', userSchema)

module.exports = { UserModel: User }