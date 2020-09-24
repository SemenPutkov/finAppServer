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
const PORT = config.get('port') || 5000

const httpServer = http.createServer()
httpServer.on('request', (req, res) => {
    console.log(req.url)
    res.setHeader('Location', 'https://www.xn----8sbmntmdok4b3d.xn--p1ai/index')
    res.statusCode = 301
    res.end()
})

const httpsOptions = {
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'my-expenses.crt')), // путь к сертификату
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'my-expenses.key')) // путь к ключу
}

app.use(helmet())
app.use(express.json({ extended: true }))
app.use('/login', authRoutes)
app.use('/db', dbRoutes)

app.get('/', (req, res) => res.redirect('/index'))
if (process.env.NODE_ENV === 'production') {
    app.use('/', express.static(path.join(__dirname, 'client', 'build')))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}
async function start() {
    try {
        await mongoose.connect(config.get('dbURI'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        if (process.env.NODE_ENV === 'production') {
            httpServer.listen(80)
            https.createServer(httpsOptions, app).listen(443)
        }
        else { app.listen(PORT, () => console.log(`Start dev server on port ${PORT}`)) }
    } catch (e) {
        console.log('Server Error', e.message)
        process.exit(1)
    }
}
start()

db.on('open', () => console.log('connect to db in', process.env.NODE_ENV, 'mod, on port: ', PORT))





