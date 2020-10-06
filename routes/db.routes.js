const { Router } = require('express')
const router = Router()

const { CostRowModel } = require('../models/CostItemModel')

router.get('/get-user-data/:id', async (req, res) => {
    console.log('Ищу по id', req.params.id)
    try {
        if (!req.params.id) throw new Error('bad data')
        const data = await CostRowModel.find({ "userId": req.params.id })
        if (data) return res.status(200).json(data)
        throw new Error('no content')
    } catch (e) {
        res.status(204).json(e.message)
    }
})
router.get('/get-user-data/details/monthId/:id', async (req, res) => {
    console.log('details month search ', req.query)
    const a = req.query.from.split('-')
    const b = req.query.to.split('-')
    let inputArr = []
    a.forEach(numb => inputArr.push(+numb))
    b.forEach(numb => inputArr.push(+numb))
    // console.log('input arrow', inputArr)
    const searchArr = []
    const monthsArr = []
    if (inputArr[0] < inputArr[2]) {
        //прямой поток
        for (let i = inputArr[0]; i <= inputArr[2]; i++) {
            const item = String(`${i}-${inputArr[1]}`)
            monthsArr.push(i - 1)
            searchArr.push(item)
        }
    } else {
        //обратный поток
        for (let i = inputArr[2]; i <= inputArr[0]; i++) {
            const item = String(`${i}-${inputArr[1]}`)
            searchArr.push(item)
        }
    }
    try {
        const data = await CostRowModel.find({ userId: req.params.id, monthId: { $in: [...searchArr] } })
        if (data) return res.status(200).json({ ...data })
        throw new Error('not found')
    } catch (e) {
        console.log(e.message)
        res.status(503).json(e.message)
    }
})
router.get('/get-user-data/details/sectionId/:id', async (req, res) => {
    console.log('details select search ', req.query)
    try {
        const data = await CostRowModel.find({ userId: req.params.id, controllerId: req.query.controllerId })
        if (data) return res.status(200).json({ ...data })
        throw new Error('not found')
    } catch (e) {
        console.log(e.message)
        res.status(503).json(e.message)
    }
})
router.route('/set-user-data')
    .post(async (req, res) => {
        console.log('save item')
        try {
            const item = new CostRowModel({ ...req.body })
            if (req.body.id === null) throw new Error('bad data')
            item.save()
            if (item) { return res.status(201).json({ item }) }
            else throw new Error('cant create, try later')
        } catch (e) {
            console.log(e.message)
            res.status(503).json(e.message)
        }
    })
    .put(async (req, res) => {
        console.log('change item')
        try {
            const item = new CostRowModel({ ...req.body })
            if (req.body.id === null) throw new Error('bad data')
            const replacer = await CostRowModel.findByIdAndUpdate(item._id, {
                $set: {
                    userId: item.userId,
                    change: false,
                    block: false,
                    yearId: req.body.yearId,
                    monthId: req.body.monthId,
                    dayId: req.body.dayId,
                    controllerId: req.body.controllerId,
                    controller: {
                        select: { value: req.body.controller.select.value },
                        text: { value: req.body.controller.text.value },
                        cost: { value: req.body.controller.cost.value },
                        f_date: {
                            value: req.body.controller.f_date.value,
                            out_value: req.body.controller.f_date.out_value
                        }
                    }
                }
            })
            if (replacer) { return res.status(200).json({ item: replacer }) }
            else throw new Error('cant update, try later')
        } catch (e) {
            console.log(e.message)
            res.status(503).json(e.message)
        }
    })
    .delete(async (req, res) => {
        console.log('delete item')
        try {
            const id = req.body._id
            const deleter = await CostRowModel.findByIdAndDelete(id)
            if (deleter) return res.status(200).json({ "delete": "success" })
            throw new Error('не удалил')
        } catch (error) {
            console.log(error.message)
            return res.status(404).json({ "delete": "wrong" })
        }
    })


module.exports = router