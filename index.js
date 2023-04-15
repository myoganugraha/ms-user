require('dotenv').config()

const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');
const cors = require("cors")
const jwt = require("jsonwebtoken");
const UserModel = require('./model/user')

const saltRound = 10

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

async function connectMongoDb() {
    await mongoose.connect(`${process.env.MONGODB_URL}`, { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'user_db', }).then(() => {
        console.log("MongoDB Connected")
    })
}

async function initialLoad() {
    await connectMongoDb()
}

initialLoad()


// GET All Users
app.get("/users", async (_, res) => {
    UserModel.find().then((users) => {
        res.send({
            data: users,
            total_data: users.length
        }).status(200)
    }).catch((error) => {
        res.send({
            message: error,
            data: null
        }).status(400)
        throw error
    })
})

// CREATE New User
app.post("/user/new", async (req, res) => {
    try {
        const { firstName, lastName, email, phone, address, username, password } = req.body

        const isEmailOrUsernameOrPhoneAlreadyRegistered = await UserModel.findOne({
            $or: [
                { email },
                { username },
                { phone },
            ]
        })

        if (isEmailOrUsernameOrPhoneAlreadyRegistered) {
            return res.status(409).send({
                message: "Email or Username or Phone already registered."
            })
        }

        await UserModel.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: bcrypt.hashSync(password, saltRound),
            phone,
            address,
            username: username.toLowerCase(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
        res.send({
            message: "New user successfully created."
        }).status(201)
    } catch (error) {
        res.send({
            message: `Failed to create new user ${error}`
        }).status(400)
        throw error
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, username, password } = req.body

        const userData = await UserModel.findOne({
            $or: [
                { email },
                { username },
            ]
        })

        if (userData) {
            const isPasswordCorrect = bcrypt.compareSync(password, userData.password)
            if (!isPasswordCorrect) {
                return res.send({
                    message: `Invalid Password`
                }).status(400)
            } else {
                const token = jwt.sign(
                    { user_id: userData._id, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
                await UserModel.findByIdAndUpdate(userData._id, { token: token })
                res.status(200).json({ data: token })
            }
        }
    } catch (error) {
        res.send({
            message: `Login Failure Reason: ${error}`
        }).status(400)
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Running on port ${process.env.PORT}`)
})
