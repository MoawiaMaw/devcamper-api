const express = require('express');
const {
    getCourse,
    getCourses,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');
const advanceResults = require('../middleware/advanceResults');
const Course = require('../models/Course');

const {
    protect,
    authorize
} = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Course, { path: 'bootcamp', select: 'name description' }), getCourses)        //get all courses
    .post(protect, authorize('publisher', 'admin'), createCourse);    //create course

router.route('/:id')
    .get(getCourse)          //get single course
    .put(protect, authorize('publisher', 'admin'), updateCourse)       //update course
    .delete(protect, authorize('publisher', 'admin'), deleteCourse)    //delete course


module.exports = router;
