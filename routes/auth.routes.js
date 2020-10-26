const { Router } = require('express')
const fetch = require('node-fetch')
const router = Router()
const { UserModel } = require('../models/UserModel')
const { Types } = require('mongoose')

// @desc Login with Yandex from Auth page
// initiator Auth.js(18~), Auth.SomeFunc()

router.post('/with-yandex/:oToken', async (req, res) => {
    const oToken = req.params.oToken
    if (!oToken) return res.status(403).json({ "message": "wrong auth data" })

    const url = 'https://login.yandex.ru/info?oauth_token=' + oToken
    const response = await fetch(url)
    const data = await response.json()
    // console.log('Yandex oAuth data', data)

    if (data.default_email) {
        data.oauth_token = oToken
        const user = await UserModel.findOne({ useremail: data.default_email })
        if (user) {
            if (user.oauth_token === oToken) {
                return res.status(200).json(user)
            }

            user.oauth_token = data.oauth_token
            await user.save()
            return res.status(200).json(user)

        }

        console.log('Пользователь не найден, создаем нового ')
        const newUser = new UserModel({
            "_id": Types.ObjectId(),
            "useremail": data.default_email,
            "user_id": data.id,
            "oauth_token": data.oauth_token,
            "username": data.display_name,
            "first_name": data.first_name,
            "last_name": data.last_name,
        })
        const newbie = await newUser.save()
        if (newbie) return res.status(201).json(newbie)
    }

    res.status(403).json({ "message": "forbidden" })
})

// @desc get Yandex user data from App page
// initiator Auth.js(42~), anchor from Auth.render()

router.get('/with-yandex/:id', async (req, res) => {
    const id = req.params.id
    const user = await UserModel.findOne({ _id: id })
    if (user) {
        const url = 'https://login.yandex.ru/info?oauth_token=' + user.oauth_token
        const response = await fetch(url)
        if (response.status === 401) return res.status(403).json({ "message": "logout" })
        console.log('доступ разрешен')

        return res.status(200).json(user)
    }
    return res.status(403).json({ "message": "logout" })
})


// @desc handle google response data, verify user in DB
// initiator Auth.js, authGoogle()
router.post('/with-google/:oToken', async (req, res) => {
    const oToken = req.params.oToken
    if (!oToken) return res.status(403).json({ "message": "wrong auth data" })
    const userData = { ...req.body }

    const user = await UserModel.findOne({ useremail: userData.useremail })
    if (user) { return res.status(200).json(user) }

    console.log('Пользователь не найден, создаем нового ')
    const newUser = UserModel({ ...req.body })
    const newbie = await newUser.save()
    if (newbie) { return res.status(201).json(newbie) }
    res.status(403).json({ "message": "forbidden" })
})

// @desc handle google response data, verify user in DB
// initiator Auth.js, authGoogle()

router.get('/with-google/:id', async (req, res) => {
    const id = req.params.id

    const user = await UserModel.findById(id)
    if (user) return res.status(200).json(user)

    return res.status(403).json({ "message": "logout" })
})

module.exports = router