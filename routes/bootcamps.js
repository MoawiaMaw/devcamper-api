const express = require('express');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp } = require('../controllers/bootcamps');
const router = express.Router();

router.route('/')
    .get(getBootcamps)          //get all
    .post(createBootcamp);      //post new

router.route('/:id')
    .get(getBootcamp)           //get one
    .put(updateBootcamp)        //update
    .delete(deleteBootcamp);    //delete


module.exports = router; 