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

    const data = $('marquee').eq(1).find('table');
    for(let k=0; k<data.length; k++){
        let sem = {};
        for(let i=2, j=1; i<$(data).eq(k).find('tr').length; i++){
            if($(data).eq(k).find('tr').eq(i).find('td').length === 3){
                let message = {};
                message['faculty'] = $(data).eq(k).find('tr').eq(i).find('td').eq(2).text().trim();
                message['course'] = $(data).eq(k).find('tr').eq(i+1).find('td').eq(2).text().trim();
                message['content'] = $(data).eq(k).find('tr').eq(i+2).find('td').eq(2).text().trim();
                message['sent'] = $(data).eq(k).find('tr').eq(i+3).find('td').eq(2).text().trim();
                sem['message-'+j.toString()] = message;
                j++;
                i+=3;
            }
        }
        info[$(data).eq(k).find('tr').eq(1).find('td').text().trim()] = sem;
    }

    fn(info);
}

const messages = function (regno, callback) {

    const cookieJ = unirest.jar();
    let Uri = config.student_home;

    if(cache.get(regno) != null){
        const cookieSerial = cache.get(regno).cookie;
        cookieJ.add(unirest.cookie(cookieSerial), Uri);

        unirest.get(Uri)
            .jar(cookieJ)
            .timeout(28000)
            .end(function (response) {
                if(response.body != null){
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

};

exports.messages = messages;