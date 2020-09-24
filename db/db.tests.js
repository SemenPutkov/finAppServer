const { connect, Schema, Types, model, connection } = require('mongoose')

const object_id = '5f2bf6e9ef658213bcd9f51a'
const object_id2 = '5f2c0b503f01e0025cfdb4b9'
const db = connection

const url = "mongodb+srv://user-admin-db:user-admin-db@cluster0.y5lla.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority"



const userSchema = Schema({
    username: { type: String, required: true, unique: true },
    userItems: [{ type: Types.ObjectId, ref: 'CostItem' }]

})
const costSchema = Schema({
    id: Number,
    userId: { type: Types.ObjectId, ref: 'User' },
    change: Boolean,
    block: Boolean,
    controller: {
        select: { value: String },
        text: { value: String },
        cost: { value: Number },
        f_date: {
            value: Date,
            out_value: Date
        }
    }
})

const User = model('User', userSchema)
const CostRow = model('CostItem', costSchema)

const user = new User({ username: 'Sasha Foxxx' })

const costItem = new CostRow({
    id: 0,
    userId: object_id2,
    change: false,
    block: false,
    controller: {
        select: { value: 'Дом/ремонт' },
        text: { value: 'Молоток' },
        cost: { value: 300 },
        f_date: {
            value: Date('2020-05-31'),
            out_value: Date('2020-05-31'),
        }
    }
});


connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    // .then(() => user.save())
    // .then(() => User.find({}))
    // .then(() => costItem.save())
    .then(() => CostRow.find({ 'userId': object_id2 }))
    .then(items => {
        items.map(item => console.log(item.controller.text.value))
    })
    .catch(e => console.log(e))
    .then(() => db.close())


// user.save(e => {

//     if (e) return console.log(e)
//     console.log('saved')
// })
// User.find({})
//     .then((data, err) => {
//         mongoose.disconnect()
//         if (err) return console.log(err)
//         data.forEach(item => users.push(item._id))
//         console.log(users)
//     })

// User.find({ usertoken: 'secondtokentry' })
//     .then((data, err) => {
//         mongoose.disconnect()
//         if (err) return console.log(err)
//         data.forEach(item => users.push(item._id))
//         console.log(users)
//     })


// costItem.save(e => {
//     mongoose.disconnect()
//     if (e) return console.log(e)
//     console.log('saved')
// })
