const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');


//@desc     Get all users
//@route    GET /api/v1/admin/users
//@access   Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {

    res.status(200).json(res.advanceResult);

});

//@desc     Get single user
//@route    GET /api/v1/admin/users/:id
//@access   Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new ErrorResponse(`user with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Create user
//@route    POST /api/v1/admin/users
//@access   Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Update user
//@route    PUT /api/v1/admin/users/:id
//@access   Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!user) {
        return next(new ErrorResponse(`user with id ${req.params.id} not found`, 404));
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

//@desc     Delete user
//@route    DELETE /api/v1/admin/users/:id
//@access   Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`user with id ${req.params.id} not found`, 404));
    }

    await user.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

