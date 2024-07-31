const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');
const express = require('express');

const router = express.Router();


router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.toursWithin);

router.use('/:tourId/reviews', reviewRouter);

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/tour-stats').get(tourController.getTourStats);
router
    .route('/monthly-plan/:year')
    .get(
        authController
            .restrictTo('user', 'lead-guide', 'guide'),
        tourController.getMonthlyPlan
    );

router
    .route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('user', 'lead-guide', 'admin'), tourController.createTour);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        // authController.restrictTo('admin','lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;





/*
express.Router() Function:

express.Router() is a function provided by the Express module.
It creates a new router object that can be used to handle a subset of routes.
A router is like a mini-application, capable of having its own routes and middleware.
*/

// router.param('id', tourController.checkID);

/*
router.param Method:

The router.param method is used to define middleware that will run automatically when a specific route parameter is present in the route path.
It allows you to intercept the request and perform some logic whenever a particular parameter is detected.
Parameter Name 'id':

'id' is the name of the route parameter that this middleware is targeting.
This means that whenever a route with the :id parameter is accessed (e.g., /tours/:id), the specified middleware function will be invoked.

*/