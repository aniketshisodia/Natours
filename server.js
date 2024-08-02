const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

// process.on('uncaughtException', err => {
//     console.log('UNCAUGHT EXCEPTION ✨ Shutting Down...');
//     console.log(err.name, err.message);
// });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB Connection');
    // .catch(err => console.log(err));
});

// process.on('Unhandled Rejection', err => {
//     console.log(err.name, err.message);
//     console.log('UNHANDLED REJECTION ! 🎇🎇 SHUTTING DOWN');
//     server.close(() => {
//         process.exit(1);
//     });
// });

// console.log(x);


// const testTour = new Tour({
//     name: 'Forest Hiker',
//     rating: 4.5,
//     price: 490
// })
// // we get doc that just saved tp database
// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log('Error 👿', err)
// });

// console.log(app.get('env'));
// console.log(process.env);

// test 
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App runnning on port ${port}`);
});