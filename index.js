const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const cache = require('memory-cache');

const captchaParse = require('./captcha-parse');
const login = require('./functions/login');
const config = require('./config');
const messages = require('./functions/messages');
const timetable = require('./functions/timetable');
const marks = require('./functions/marks');
const schedule = require('./functions/schedule');
const att_view = require('./functions/attendance_overview');
const att_details = require('./functions/attendance_details');

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

let cookieJ = unirest.jar();

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/api', function (request, response) {
   response.send('This the the API for project VU');
});

app.get('/api/vtop', function (request, response) {
    unirest.get(config.student_base)
        .timeout(28000)
        .end(function (res) {
           response.send(res.body);
        });
});

app.get('/loginForm', function (request, response) {
   response.render('pages/loginForm')
});

app.post('/login', function (request, response) {

    const regno = request.body.regno.toUpperCase();
    const password = request.body.password;

    login.login(regno, password, function (name, regno, cookieJar, err) {

        if (err.code === 200){
            cookieJ = cookieJar;

            unirest.get(config.student_home)
                .jar(cookieJar)
                .timeout(28000)
                .end(function (res) {
                    response.json({result : err, cookie : cookieJar});
                });
        }
        else {
            response.json({result : err});
        }

    });
});

app.post('/messages', function (request, response) {

    const reg_no = request.body.reg_no;

    messages.messages(reg_no, function (err, info) {
        if(err.code === 200){
            response.json({result: config.codes.success, info : info});
        }
        else if (err.code == 700){
            response.json({result: config.codes.noData});
        }
        else {
            response.json({result : config.codes.sessionTimedOut});
        }
    });

});

app.post('/courses', function (request, response) {

    let url = '';
    /**
     * @param {{sem:string}} data
     */

    let semester = request.body.sem;
    let reg_no = request.body.reg_no;

    timetable.timetable(reg_no, semester, function (err, info) {
       if(err.code == 200){
           response.json({result: config.codes.success, info : info});
       }
       else if (err.code == 700){
           response.json({result: config.codes.noData});
       }
       else if (err.code == 1100){
           response.json({result: config.codes.incorrectInput});
       }
       else {
           response.json({result : config.codes.sessionTimedOut});
       }
    });



});

app.post('/marks', function (request, response) {

    /**
     * @param {{sem:string}} data
     */

    let semester = request.body.sem;
    let reg_no = request.body.reg_no;

    marks.marks(reg_no, semester, function (err, info) {
        if(err.code == 200){
            response.json({result: config.codes.success, info : info});
        }
        else if (err.code == 700){
            response.json({result: config.codes.noData});
        }
        else if (err.code == 1100){
            response.json({result: config.codes.incorrectInput});
        }
        else {
            response.json({result : config.codes.sessionTimedOut});
        }
    });

});

app.post('/timetable', function (request, response) {

    let semester = request.body.sem;
    let reg_no = request.body.reg_no;

    schedule.schedule(reg_no, semester, function (err, info) {
        if(err.code == 200){
            response.json({result: config.codes.success, info : info});
        }
        else if (err.code == 700){
            response.json({result: config.codes.noData});
        }
        else if (err.code == 1100){
            response.json({result: config.codes.incorrectInput});
        }
        else {
            response.json({result : config.codes.sessionTimedOut});
        }
    });

});

app.post('/attendance', function (request, response) {

    /**
     * @param {{from_date:string}} data
     */
    /**
     * @param {{to_date:string}} data
     */

    let semester = request.body.sem;
    let reg_no = request.body.reg_no;
    let from = request.body.from_date;
    let to = request.body.to_date;

    att_view.attendance_overview(reg_no, semester, from, to, function (err, info) {

        if(err.code == 200){
            response.json({result: config.codes.success, info : info});
        }
        else if (err.code == 700){
            response.json({result: config.codes.noData});
        }
        else if (err.code == 1100){
            response.json({result: config.codes.incorrectInput});
        }
        else {
            response.json({result : config.codes.sessionTimedOut});
        }

    });

});

app.post('/attdetails', function (request, response) {

    /**
     * @param {{coursecode:string}} data
     */
    /**
     * @param {{coursetype:string}} data
     */
    /**
     * @param {{year:string}} data
     */

    let semester = request.body.sem;
    let reg_no = request.body.reg_no;
    let year = request.body.year;
    let from = request.body.from_date;
    let to = request.body.to_date;
    let classnbr = request.body.classnbr;
    let coursecode = request.body.coursecode;
    let coursetype = request.body.coursetype;

    att_details.attendance_details(reg_no, semester, year, classnbr, from, to, coursecode, coursetype, function (err, info) {
        if(err.code == 200){
            response.json({result: config.codes.success, info : info});
        }
        else if (err.code == 700){
            response.json({result: config.codes.noData});
        }
        else if (err.code == 1100){
            response.json({result: config.codes.incorrectInput});
        }
        else {
            response.json({result : config.codes.sessionTimedOut});
        }
    });

});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


