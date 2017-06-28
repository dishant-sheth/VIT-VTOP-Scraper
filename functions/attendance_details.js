/**
 * Created by dishant on 27/6/17.
 */

const cheerio = require('cheerio');
const unirest = require('unirest');
const cache = require('memory-cache');
const fs = require('fs');

const config = require('../config');

function onRequest(body, callback) {

    let fn = typeof callback === 'function' ? callback : new Function(callback);

    const $ = cheerio.load(body);

    let info = {};
    let course = {};
    let attendance = {};

    const data1 = $('table').find('table').eq(0).find('tr');

    course['code'] = $(data1).eq(1).find('td').eq(0).text().trim();
    course['name'] = $(data1).eq(1).find('td').eq(1).text().trim();
    course['type'] = $(data1).eq(1).find('td').eq(2).text().trim();
    course['slot'] = $(data1).eq(1).find('td').eq(3).text().trim();
    info['course'] = course;

    const data2 = $('table').find('table').eq(1).find('tr');

    for (let i=2; i<data2.length; i++){
        let day = {};
        let no = $(data2).eq(i).find('td').eq(0).text().trim();
        day['date'] = $(data2).eq(i).find('td').eq(1).text().trim();
        day['slot'] = $(data2).eq(i).find('td').eq(2).text().trim();
        day['status'] = $(data2).eq(i).find('td').eq(3).text().trim();
        day['unit'] = $(data2).eq(i).find('td').eq(4).text().trim();
        day['reason'] = $(data2).eq(i).find('td').eq(5).text().trim();
        attendance[no] = day;
    }
    info['attendance'] = attendance;

    fn(info);

}

const attendance_details = function (regno, semester, year, classnbr, from, to, course_code, course_type, callback) {

    const cookieJ = unirest.jar();
    let sem_code = '';
    const Uri = config.attendance_details;

    if(semester == 'WS' || semester == 'FS'){
        switch (semester){
            case 'WS' : sem_code = "WINSEM" + year;
                        break;
            case 'FS' : sem_code = "FALLSEM" + year;
                        break;
        }

        if(cache.get(regno) != null){
            const cookieSerial = cache.get(regno).cookie;
            cookieJ.add(unirest.cookie(cookieSerial), Uri);

            const data = {
                semcode : sem_code,
                classnbr : classnbr,
                from_date : from,
                to_date : to,
                crscd : course_code,
                crstp : course_type
            };

            unirest.post(Uri)
                .jar(cookieJ)
                .form(data)
                .timeout(48000)
                .end(function (response) {
                    if (response.body != null){
                        onRequest(response.body, function (info) {
                            return callback(config.codes.success, info);
                        });
                    }
                    else {
                        return callback(config.codes.noData, null);
                    }
                });


        }

        else {
            return callback(config.codes.sessionTimedOut, null);
        }

    }
    else {
        return callback(config.codes.incorrectInput, null);
    }

};

exports.attendance_details = attendance_details;