const mongoose = require("mongoose");

const collectionName = "users"

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        dropDups: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        dropDups: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        dropDups: true,
    },
    address: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        required: false
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
        required: true
    },
    token: {
        type: String,

    }
})

const UserModel = mongoose.model(collectionName, userSchema)

module.exports = UserModel