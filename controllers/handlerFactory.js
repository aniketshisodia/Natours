const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../appError');
const { Model } = require('mongoose');
exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
        return next(new AppError('No tour found with taht id', 400));
    }
    res.status(204).json({
        status: "success",
        message: 'data deleted',
        data: null
    });
})


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!doc) {
        return next(new AppError('No tour found with taht id', 400));
    }
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    });
})


exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
        status: 'Success',
        data: {
            tour: doc
        }
    });
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) {
        query = query.populate(popOptions);
    }

    const doc = await Model.findById(req.params.id).populate('reviews')


    if (!doc) {
        return next(new AppError('No tour found with taht id', 400));
    }
    res.status(200).json({
        status: 'success',
        data: doc
    });
})

exports.getAll = Model => catchAsync(async (req, res, next) => {

    let filter = {};
    if (req.params.tourId) {
        filter = { tour: req.params.tourId };
    }

    const features = new APIFeatures(Model.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
    const doc = await features.query;
    // const doc = await features.query.explain();
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            doc
        }
    });
})
