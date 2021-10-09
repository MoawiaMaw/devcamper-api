const express = require('express');
const router = express.Router();

//get all
router.get("/", (req, res) => {
    res.status(200).send({ success: true, msg: 'get all bootcamps' });
});
//get one
router.get('/:id', (req, res) => {
    res.status(200).send({ success: true, msg: `show bootcamp ${req.params.id}` });
});
//post
router.post('/', (req, res) => {
    res.status(201).send({ success: true, msg: `post new bootcamp` });
});
//update 
router.put('/:id', (req, res) => {
    res.status(200).send({ success: true, msg: `update bootcamp ${req.params.id}` });
});
//delete
router.delete('/:id', (req, res) => {
    res.status(200).send({ success: true, msg: `delete bootcamp ${req.params.id}` });
});

module.exports = router;