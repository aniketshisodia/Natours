const catchAsync = require('./../utils/catchAsync');
const Review = require('./../models/reviewModel')
const factory = require('./handlerFactory');
exports.getAllReviews = factory.getAll(Review);


exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);


exports.setTourIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);