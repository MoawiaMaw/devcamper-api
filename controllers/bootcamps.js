const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async');
const path = require('path');

//@desc     Get all bootcamps
//@route    GET /api/v1/bootcamps
//@access   Public 
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advanceResult);
});

//@desc     Get single bootcamp
//@route    GET /api/v1/bootcamps/:id
//@access   Public 
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Create new bootcamp
//@route    POST /api/v1/bootcamps
//@access   Private 
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // add user to body
    req.body.user = req.user.id;

    //check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

    //if the user not admin, they can only publish one
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`the user with id ${req.user.id} has already published a bootcamp`, 400));
    }

    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

//@desc     Update bootcamp
//@route    PUT /api/v1/bootcamps/:id
//@access   Private 
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404));
    }

    //make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to update this bootcamp`, 401))
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bootcamp
    })
});

//@desc     Delete bootcamp
//@route    DELETE /api/v1/bootcamps/:id
//@access   Private 
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404));
    }

    //make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to delete this bootcamp`, 401))
    }

    bootcamp.remove();
    res.status(200).json({
        success: true,
        data: {}
    })
});


//file uploading
//@desc     upload photo for bootcamp
//@route    PUT /api/v1/bootcamps/:id/photo
//@access   Private 
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        return next(new ErrorResponse(`bootcamp not found with id ${req.params.id}`, 404));
    }

    //make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`user ${req.user.id} is not authorized to update this bootcamp`, 401))
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload file`, 400));
    }
    const file = req.files.file;

    // making sure the uploaded file is an image
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Pleases upload an image file`, 400));
    }

    //check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Pleases upload an image less than 1MB`, 400));
    }

    //create costum file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Problem occured during uploading`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
        res.status(200).json({
            success: true,
            data: file.name
        });
    });


});


//@desc     get bootcamps within a radius
//@route    GET / api / v1 / bootcamps / radius /: zipcode /: distance
//@access   Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    //get lng and lat from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // calc radius using radiance -/divide distance by radius of earth/ -/earth radius is 3,963 miles, 6,378 km/ /
    const radius = distance / 6378;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });


    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
});