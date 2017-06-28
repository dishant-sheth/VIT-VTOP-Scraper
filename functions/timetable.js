/**
 * Created by dishant on 21/6/17.
 */


const cheerio = require('cheerio');
const unirest = require('unirest');
const cache = require('memory-cache');

const config = require('../config');

function onRequest(body, callback){
    let fn = typeof callback === 'function' ? callback : new Function(callback);

    const $ = cheerio.load(body);

    let info = {};

    const data = $('table').find('table').eq(0).find('tr');

    for(let j=1; j<data.length+1; j++){
        let i = 0;
        let course = {};
        if(!$(data).eq(j).find('td').eq(0).text().trim()) i = 2;
        if($(data).eq(j).find('td').length < 3) continue;
        course['class-number'] = $(data).eq(j).find('td').eq(i).text().trim();
        course['code'] = $(data).eq(j).find('td').eq(i+1).text().trim();
        course['name'] = $(data).eq(j).find('td').eq(i+2).text().trim();
        course['type'] = $(data).eq(j).find('td').eq(i+3).text().trim();
        course['mode'] = $(data).eq(j).find('td').eq(i+5).text().trim();
        course['option'] = $(data).eq(j).find('td').eq(i+6).text().trim();
        course['slot'] = $(data).eq(j).find('td').eq(i+7).text().trim();
        course['venue'] = $(data).eq(j).find('td').eq(i+8).text().trim();
        course['faculty'] = $(data).eq(j).find('td').eq(i+9).text().trim();
        course['status'] = $(data).eq(j).find('td').eq(i+10).text().trim();
        let creds = {};
        const credits = $(data).eq(j).find('td').eq(i+4).text().trim().split(' ');
        //LTPJC
        creds['L'] = credits[0];
        creds['T'] = credits[1];
        creds['P'] = credits[2];
        creds['J'] = credits[3];
        creds['C'] = credits[4];
        course['credits'] = creds;
        info[j.toString()] = course;
    }

    fn(info);
}

const timetable = function (regno, semester, callback) {
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

exports.timetable = timetable;