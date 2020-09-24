const { Router } = require('express')
const fetch = require('node-fetch')
const router = Router()
const { UserModel } = require('../db/databaseModels.js')
const { Types } = require('mongoose')

router.post('/with-yandex/:oToken', async (req, res) => {
    const oToken = req.params.oToken
    if (!oToken) return res.status(400).json({ "message": "no oauth_token" })
    const url = 'https://login.yandex.ru/info?oauth_token=' + oToken
    const response = await fetch(url)
    // console.log('Yandex response', response)
    const data = await response.json()
    // console.log('Yandex oAuth data', data)
    if (data.default_email) {
        data.oauth_token = oToken
        const client = await UserModel.findOne({ useremail: data.default_email })
        if (client) {
            // console.log('данные из БД:', client)
            if (client.oauth_token === oToken) {
                return res.status(200).json(client)
            }
            console.log('Разные токены')
            client.oauth_token = data.oauth_token
            await client.save()
            return res.status(200).json(client)

        }
        console.log('Пользователь не найден, создаем нового ')
        const newUser = new UserModel({
            "_id": Types.ObjectId(),
            "useremail": data.default_email,
            "oauth_token": data.oauth_token,
            "username": data.display_name,
            "first_name": data.first_name,
            "last_name": data.last_name,
        })
        const saveResult = await newUser.save()
        if (saveResult) return res.status(201).json(saveResult)
    }

    res.status(403).json({ "message": "forbidden" })
})

router.get('/with-yandex/:id', async (req, res) => {
    const id = req.params.id
    const client = await UserModel.findOne({ _id: id })
    if (client) {
        const url = 'https://login.yandex.ru/info?oauth_token=' + client.oauth_token
        const response = await fetch(url)
        if (response.status === 401) return res.status(404).json({ "message": "logout" })
        console.log('доступ разрешен')

        return res.status(200).json(client)
    }
    return res.status(404).json({ "message": "logout" })
})

module.exports = router