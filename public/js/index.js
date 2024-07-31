const loginForm = document.querySelector('.form--login');
const logOutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
/*****************************  login functionality ******************************************/

const login = async (email, password) => {
    try {
        // console.log(email, password);
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        })
        console.log(res);
        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 100);
        }
    }
    catch (err) {
        showAlert('error', 'error is here');
        // console.log(err.response.data);
    }
};

// module.exports = login;

if (loginForm) {

    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

// *****************************  login functionality ******************************************


// *****************************  A L E R T ******************************************


const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}

const showAlert = (type, msg) => {
    // console.log('hide alert');
    hideAlert();
    const markUp = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markUp);
    window.setTimeout(hideAlert, 5000);
    console.log('show alert');
}
// *****************************  A L E R T ******************************************




// *****************************  LOG  OUT ******************************************


const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        if (res.data.status = 'success') {
            location.reload(true);
        }
    }
    catch (err) {
        showAlert('error', 'try again')
        console.log(err.response.data);
    }
}

if (logOutButton) logOutButton.addEventListener('click', logout);




// *****************************  Logout ******************************************






// *****************************  U P D A T E  U S E R ******************************************

if (userDataForm) {
    userDataForm.addEventListener('submit', async e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(form);
        await updateSettings(form, 'data');
    })
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        console.log('hello i m updating');
        document.querySelector('.btn--save').textContent = 'Updating.....';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateSettings(
            { passwordCurrent, password, passwordConfirm },
            'password'
        );
        console.log('hello i m saving');
        document.querySelector('.btn--save').textContent = 'Save Password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    })
}


// type is either password or data {email or name }
const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updateMyPassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated Successfully!`);
        }
    }
    catch (err) {
        showAlert('error', err.response.message);
    }

}


// *****************************  U P D A T E  U S E R ******************************************



// *****************************  P A Y M E N T  U S I N G  S T R I P E ******************************************
// const stripe = loadStripe('pk_test_51Pi0orISkxnst0m2W6GeXBEBOaoi1urBxd0aG05ZFqSAbgw4wiKeX1n0fLWZ17t31BwF32toCa7L2AgpuFpIL6Yx00onbkemK9');

// const bookBtn = document.getElementById('book-tour');

// const bookTour = async tourId => {
//     try {
//         // 1) get checkout session from API
//         const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
//         e.target.textContent = 'Booked';
//         console.log('session is ', session);
//         // 2) create checkotu form + credit card
//         await stripe.redirectToCheckout({ sessionId: session.data.session.id });
//     }
//     catch (err) {
//         console.log("error is ", err);
//     }
// }

// if (bookBtn)
//     bookBtn.addEventListener('click', e => {
//         console.log('Button this side');
//         e.target.textContent = 'Processing..........';
//         const { tourId } = e.target.dataset;
//         bookTour(tourId);
//     })

// ****************************  P A Y M E N T  U S I N G  S T R I P E ******************************************

