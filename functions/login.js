/**
 * Created by dishant on 21/6/17.
 */

const unirest = require('unirest');
const captchaParse = require('../captcha-parse');
const config = require('../config');
const cheerio = require('cheerio');

const authenticate = function (data, url, callback, tries) {

    if(tries > 10){
        return callback(null, null, null, config.codes.triesExceeded);
    }

    let cookieJ = unirest.jar();

    captchaParse.parseCaptcha(url.captcha, data.regno ,function (captcha, captcha_cookie) {


        cookieJ.add(unirest.cookie(captcha_cookie), url.submit);
        data.vrfcd = captcha;
        unirest.post(config.submit_url)
            .jar(cookieJ)
            .form(data)
            .timeout(28000)
            .end(onSubmitPost);




    });

    const onSubmitPost = function (response) {
        if(response.body == null){
            callback(null, null, null, config.codes.vitDown);

        }
        else{
            let $ = cheerio.load(response.body, {
                ignoreWhitespace : true
            });

            let hidden_object = $('input[type="hidden"]')['0'];

            if(hidden_object){
                if(hidden_object.attribs.value == 'Verification Code does not match.  Enter exactly as shown.' || 'Enter Verification Code of 6 characters exactly as shown.' == hidden_object.attribs.value){
                    authenticate(data, url, callback, tries + 1);
                }
                else{
                    callback(null, null, null, config.codes.invalidCredentials);
                }
            }
            else {
                callback('', '', cookieJ, config.codes.success);
            }

        }
    };

};

const login = function(reg, pass, callback){

    let data = {
        regno : reg,
        passwd: pass
    };

    let url = {
        submit : config.submit_url,
        home : config.student_home,
        captcha : config.captcha_url
    };
    authenticate(data, url, callback, 0);
};



module.exports.login = login;