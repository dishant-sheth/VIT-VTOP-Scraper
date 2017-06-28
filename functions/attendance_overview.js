/**
 * Created by dishant on 26/6/17.
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

    const data = $('table').find('table').eq(3).find('tr');

    for (let j=1; j<data.length; j++) {
        let course = new Object();
        let attendance = new Object();
        let no = $(data).eq(j).find('td').eq(0).text().trim();
        course['code'] = $(data).eq(j).find('td').eq(1).text().trim();
        course['name'] = $(data).eq(j).find('td').eq(2).text().trim();
        course['type'] = $(data).eq(j).find('td').eq(3).text().trim();
        course['slot'] = $(data).eq(j).find('td').eq(4).text().trim();
        attendance['attended'] = $(data).eq(j).find('td').eq(6).text().trim();
        attendance['total'] = $(data).eq(j).find('td').eq(7).text().trim();
        attendance['percentage'] = $(data).eq(j).find('td').eq(8).text().trim();
        attendance['status'] = $(data).eq(j).find('td').eq(9).text().trim();
        course['attendance'] = attendance;
        info[no] = course;
    }

    fn(info);

}

const attendance_overview = function (regno, semester, from, to, callback) {
    const cookieJ = unirest.jar();

    if(semester == 'WS' || semester == 'FS'){
        let Uri = config.attendance_overview_base + semester + config.attendance_overview_query1 + from.toString() + config.attendance_overview_query2 + to.toString();
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

exports.attendance_overview = attendance_overview;