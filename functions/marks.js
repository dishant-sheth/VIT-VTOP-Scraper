/**
 * Created by dishant on 24/6/17.
 */

const cheerio = require('cheerio');
const unirest = require('unirest');
const cache = require('memory-cache');

const config = require('../config');


function onRequest(body, callback){
    let fn = typeof callback === 'function' ? callback : new Function(callback);

    const $ = cheerio.load(body);

    let info = {};

    const data = $('body').children().eq(0).find('table').eq(0).find('tr');

    for(let i=1, j=1; i<data.length; i+=2, j++){
        //if((j>1) && (info[(j-1).toString()].marks['CAT-I'] || info[(j-2).toString()].marks['CAT-I'])) continue;
        let course = new Object();
        course['class-number'] = $(data).eq(i).find('td').eq(1).text().trim();
        course['code'] = $(data).eq(i).find('td').eq(2).text().trim();
        course['name'] = $(data).eq(i).find('td').eq(3).text().trim();
        course['type'] = $(data).eq(i).find('td').eq(4).text().trim();
        course['mode'] = $(data).eq(i).find('td').eq(6).text().trim();
        course['faculty'] = $(data).eq(i).find('td').eq(7).text().trim();
        course['slot'] = $(data).eq(i).find('td').eq(8).text().trim();
        const mark = $(data).eq(i+1).find('table').eq(0).find('tr');
        const columns = $(data).eq(i+1).find('table').eq(0).find('tr').eq(0).find('td');
        let details = new Object();
        for(let k=1; k<mark.length; k++){
            let det = new Object();
            for(let l=1; l<$(mark).find('td').length; l++){
                det[$(columns).eq(l).text().trim()] = mark.eq(k).find('td').eq(l).text().trim();
            }
            details[mark.eq(k).find('td').eq(1).text().trim()] = det;
        }
        course['marks'] = details;
        info[j.toString()] = course;
        if(info[j.toString()].marks['CAT-I'] || info[j.toString()].marks['ASSESSMENT 1']) i+=4;
    }

    fn(info);

}

const marks = function (regno, semester, callback) {

    const cookieJ = unirest.jar();


    if (semester == 'WS' || semester == 'FS'){
        let Uri = config.marks + semester;
        if (cache.get(regno) != null){
            const cookieSerial = cache.get(regno).cookie;
            cookieJ.add(unirest.cookie(cookieSerial), Uri);

            unirest.get(Uri)
                .jar(cookieJ)
                .timeout(28000)
                .end(function (response) {
                    if(response != null){
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

exports.marks = marks;