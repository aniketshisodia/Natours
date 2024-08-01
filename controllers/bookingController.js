const Booking = require('./../models/bookingsModel');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sharp = require('sharp');
const multer = require('multer');
const mongoose = require('mongoose');
const express = require('express');
const Tour = require('./../models/tourModel')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../appError');
const factory = require('./handlerFactory');
// const { PaymentMethods } = require('stripe/lib/resources');

// exports.getCheckOutSession = async (req, res, next) => {
//     // 1. get currently booked store
//     const tour = await Tour.findById(req.params.tourId);
//     // 2. create checkout session
//     const session = await stripe.checkout.sessions.create({
//         payment_method_types: ['card'],
//         success_url: `${req.protocol}://${req.get('host')}/?tours=${req.params.tourId}&users=${req.user.id}&price=${tour.price}`,
//         cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
//         customer_email: req.user.email,
//         client_reference_id: req.params.tourId,
//         line_items: [
//             {
//                 price_data: {
//                     currency: 'usd',
//                     product_data: {
//                         name: `${tour.name} Tour`,
//                         description: tour.summary,
//                         images: [`https://www.natours.dev/img/tours/${tour.imageCover}`]
//                     },
//                     unit_amount: tour.price * 100 // Stripe expects amount in cents
//                 },
//                 quantity: 1
//             }
//         ],
//         mode: 'payment' // Use 'payment' mode for one-time payments
//     });

//     // 3. create session as response
//     res.status(200).json({
//         status: 'success',
//         session
//     })
// }
exports.createBookingCheckout = async (req, res, next) => {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });
}

