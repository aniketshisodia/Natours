const express = require('express');
const viewController = require('./../controllers/viewsController');
const router = express.Router();
const authcontroller = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');


// router.use(authcontroller.isLoggedIn);
router.get('/', bookingController.createBookingCheckout, authcontroller.isLoggedIn, viewController.getOverview);
router.get('/', authcontroller.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authcontroller.isLoggedIn, viewController.getTour)
router.get('/login', authcontroller.isLoggedIn, viewController.getLoginForm)
router.get('/me', authcontroller.protect, viewController.getAccount);
router.post('/submit-user-data', authcontroller.protect, viewController.updateUser);


module.exports = router