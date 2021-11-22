const express = require('express');
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

const advanceResult = require('../middleware/advanceResults');
const Bootcamp = require('../models/Bootcamp');

const {
    protect,
    authorize
} = require('../middleware/auth');

//include other resource routers
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

const router = express.Router();

//re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/')
    .get(advanceResult(Bootcamp, { path: 'courses', select: 'title description' }), getBootcamps)          //get all
    .post(protect, authorize('publisher', 'admin'), createBootcamp);      //post new

router.route('/:id')
    .get(getBootcamp)           //get one
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)        //update
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);    //delete


module.exports = router;