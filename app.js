/*
    Adrikrt by [Abhishek Kumar](mailto:akbittu@gmail.com), [Nistush Tech Solutions](http://www.nistush.in).
    This work is licensed under a MIT License.
*/

// Module dependencies

var express = require('express'),
    mysql = require('mysql');

var modules = {};
    
modules.Login = require('./modules/Login');
modules.Register = require('./modules/Register');
modules.Forgot = require('./modules/Forgot');

// Application initialization

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '987654321',
    database: 'Adrikrt'
});

var app = express();

// Routings

app.get('/', function (req, res) {
    res.send('Adrikrt API');
});

var login = new modules.Login(pool);
app.route('/login/:pl/:cb/:ak')
    .get(login.initialize)
    .post(login.initialize);

var register = new modules.Register(pool);
app.route('/register/:pl/:cb/:ak')
    .get(register.initialize)
    .post(register.initialize);

var forgot = new modules.Forgot(pool);
app.route('/forgot/:pl/:cb/:ak')
    .get(forgot.initialize)
    .post(forgot.initialize);

// Begin listening

app.listen(3000, function () {
    console.log('Adrikrt listening on port 3000!');
});