const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

//@desc     Get all courses
//@route    GET /api/v1/courses
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {
        const bootcamp = await Bootcamp.findById(req.params.bootcampId);
        if (!bootcamp) {
            return next(new ErrorResponse(`bootcamp with id ${req.params.bootcampId} is not found`, 404));
        }
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        res.status(200).json({ success: true, count: courses.length, data: courses })
    } else {
        res.status(200).json(res.advanceResult);
    }
});

//@desc     Get single course
//@route    GET /api/v1/courses/:id
//@access   Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`Course with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({ success: true, data: course });
});

//@desc     Create course
//@route    POST /api/v1/bootcamp/:bootcampId/courses
//@access   Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp with id ${req.params.bootcampId} is not found`, 404));
    }

    //make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to add a course to this bootcamp`, 401))
    }

    const course = await Course.create(req.body);

    res.status(201).json({ success: true, data: course });
});

//@desc     Update course
//@route    PUT /api/v1/courses/:id
//@access   Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Course with id ${req.params.id} not found`, 404));
    }

    //make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to update this course`, 401))
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: course });
});

//@desc     Delete course
//@route    Delete /api/v1/courses/:id
//@access   Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`Course with id ${req.params.id} not found`, 404));
    }

    //make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to delete this course`, 401))
    }

    await course.remove();

    res.status(200).json({ success: true, data: {} });
});

//@desc     Get all courses within a specific bootcamp
//@route    GET /api/v1/bootcamps/:bootcampId/courses
//@access   Public
// exports.getCoursesWithinBootcamp = asyncHandler(async (req, res, next) => {
//     const courses = await Course.findById(req.params.bootcampId);
//     res.status(200).json({ success: true, count: courses.length, data: courses });
// });