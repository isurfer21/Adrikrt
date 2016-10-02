/*
    Adrikrt by [Abhishek Kumar](mailto:akbittu@gmail.com), [Nistush Tech Solutions](http://www.nistush.in).
    This work is licensed under a MIT License.
*/

// Module dependencies

var express = require('express'),
    mysql = require('mysql'),
    bodyParser = require('body-parser');

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

// parse application/x-www-form-urlencoded 
app.use(bodyParser.urlencoded({ extended: false }))

// Routings

app.get('/', function (req, res) {
    res.send('Adrikrt API');
});

var login = new modules.Login(pool);
app.post('/login', login.initialize);

var register = new modules.Register(pool);
app.post('/register', register.initialize);

var forgot = new modules.Forgot(pool);
app.post('/forgot', forgot.initialize);

// Begin listening

app.listen(3000, function () {
    console.log('Adrikrt listening on port 3000!');
});