const { Schema, model, Types } = require('mongoose')

const userSchema = Schema({
    useremail: { type: String, required: true, unique: true },
    oauth_token: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    first_name: String,
    last_name: String,
    userItems: [{ type: Types.ObjectId, ref: 'CostItem' }]

})
const costSchema = Schema({
    userId: { type: Types.ObjectId, ref: 'User' },
    change: Boolean,
    block: Boolean,
    yearId: String,
    monthId: String,
    dayId: String,
    controllerId: Number,
    controller: {
        select: { value: String },
        text: { value: String },
        cost: { value: Number },
        f_date: {
            value: String,
            out_value: String
        }
    }
})

const User = model('User', userSchema)
const CostRow = model('CostItem', costSchema)

module.exports = { UserModel: User, CostRowModel: CostRow }