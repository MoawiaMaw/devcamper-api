const express = require('express');
const {
    getReviews,
    getReview,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');
const Review = require('../models/Review');

const advanceResults = require('../middleware/advanceResults');
const {
    protect,
    authorize
} = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advanceResults(Review, { path: 'bootcamp', select: 'name description' }), getReviews)        //get all reviews
    .post(protect, authorize('user', 'admin'), createReview);    //create review

router.route('/:id')
    .get(getReview)          //get single review
    .put(protect, authorize('user', 'admin'), updateReview)       //update review
    .delete(protect, authorize('user', 'admin'), deleteReview);   //delete review


module.exports = router;
