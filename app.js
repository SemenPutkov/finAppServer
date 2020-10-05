const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const https = require('https')
const http = require('http')
const fs = require('fs')
const helmet = require('helmet')
const path = require('path')
const db = mongoose.connection
const app = express()

const dbRoutes = require('./routes/db.routes')
const authRoutes = require('./routes/auth.routes')

const HTTP_PORT = config.get('HttpPort')
const HTTPS_PORT = config.get('HttpsPort')

let httpServer = null
const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'my-expenses.crt')), // путь к сертификату
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'my-expenses.key')) // путь к ключу
}

app.use(helmet())
app.use(express.json({ extended: true }))

app.use('/login', authRoutes)
app.use('/db', dbRoutes)

app.get('/', (req, res) => {
    res.redirect('/index')
})
if (process.env.NODE_ENV === 'production') {
    httpServer = http.createServer()
    httpServer.on('request', (req, res) => {
        console.log(req.url)
        res.setHeader('Location', 'https://www.xn----8sbmntmdok4b3d.xn--p1ai/index')
        res.statusCode = 301
        res.end()
    })
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}


async function start() {
    console.log('Ports:', HTTP_PORT, HTTPS_PORT, ' - http https')
    console.log('App mod:', process.env.NODE_ENV)
    try {
        await mongoose.connect(config.get('dbURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        if (process.env.NODE_ENV === 'production') {
            httpServer.listen(HTTP_PORT, () => console.log('http server ready'))
            https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => console.log('https server ready'))
        }
        else { app.listen(HTTP_PORT, () => console.log('http server ready')) }
    } catch (e) {
        console.log('Server error', e.message)
        process.exit(1)
    }
}
start()

db.on('open', () => console.log('MongoDB ready'))





