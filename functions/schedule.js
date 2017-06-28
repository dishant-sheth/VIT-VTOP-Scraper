/**
 * Created by dishant on 25/6/17.
 */

const cheerio = require('cheerio');
const unirest = require('unirest');
const cache = require('memory-cache');
const fs = require('fs');

const config = require('../config');

//const time = ['', '8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM', '9PM '];


function onRequest(body, callback) {
    let fn = typeof callback === 'function' ? callback : new Function(callback);

    const $ = cheerio.load(body);

    let info = {};

    const data = $('table').find('table').eq(1).find('tr');

    for (let j=1; j<8; j++){
        let day = {};
        let dow = $(data).eq(j+1).find('td').eq(0).text().trim();
        for (let i=1; i< 15; i++){
            let course = {};
            let x = $(data).eq(j+1).find('td').eq(i).text().trim();
            if (x.split('-').length == 4){
                x = x.split('-');
                course['code'] = x[0];
                course['type'] = x[1];
                course['class'] = x[2];
                course['slot'] = x[3];
                day[i.toString()] = course;
            }
            else {
                day[i.toString()] = "nil";
            }
        }

        info[dow] = day;
    }

    fn(info);

}

const schedule = function (regno, semester, callback) {
    const cookieJ = unirest.jar();

    if(semester == 'WS' || semester == 'FS'){
        let Uri = config.timetable + semester;
        if(cache.get(regno) != null){
            const cookieSerial = cache.get(regno).cookie;
            cookieJ.add(unirest.cookie(cookieSerial), Uri);

            unirest.get(Uri)
                .jar(cookieJ)
                .timeout(28000)
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


exports.schedule = schedule;