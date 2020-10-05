const { Schema, model, Types } = require('mongoose')

const costSchema = Schema({
    userId: { type: Types.ObjectId, ref: 'User' },
    change: Boolean,
    block: Boolean,
    yearId: String,
    monthId: String,
    dayId: String,
    timeCreateStamp: Number,
    timeExecutionStamp: Number,
    controllerId: Number,
    color: String,
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

const CostRow = model('CostItem', costSchema)

module.exports = { CostRowModel: CostRow }