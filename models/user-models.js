const { Schema, model } = require('mongoose')


const UserSchema = new Schema({
    email: { type: String, unique: true, remove: true },
    password: { type: String, remove: true },
    userName: { type: String, unique: true, remove: true },
    isActivated: { type: Boolean, default: false },
    activationLink: { type: String },
    avatar: { type: String },
    admin:{type:Boolean,default: false}
})


module.exports = model("User", UserSchema)