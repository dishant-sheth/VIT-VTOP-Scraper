/**
 * Created by dishant on 21/6/17.
 */


const captchaRes = require('./captcha-res');
const config = require('./config');
const unirest = require('unirest');
const cache = require('memory-cache');

//calling this function returns the captcha string
const parseCaptcha = function (captcha_url, reg_no,  callback) {


    const onCaptchaRequest = function (response) {
        if(response.body == null){
            unirest.get(config.captcha_url)
                .encoding(null)
                .timeout(26000)
                .end(onCaptchaRequest);
        }
        else {
            const PixelArray = getPixelArray(response.body);
            const key = Object.keys(response.cookies)[0];
            const cookieSerial = key + "=" + response.cookies[key];
            const doc = {
                reg_no : reg_no,
                cookie : cookieSerial
            };
            cache.put(reg_no, doc);
            return callback(getCaptcha(PixelArray), cookieSerial);
        }
    };

    unirest.get(captcha_url)
        .encoding(null)
        .timeout(26000)
        .end(onCaptchaRequest);

};

// creating a 2D array of bits from the buffer received
const getPixelArray = function (bitmapBuffer) {
    const pixelArray = [];
    let subArray = [];
    let row = 0;

    //25*132 is the size of the captcha bitmap

    for(let i=bitmapBuffer.length - (25 *132), r=0; i<bitmapBuffer.length; ++i, ++r){
        if(Math.floor(r/132) != row){
            row = Math.floor(r/132);
            pixelArray.push(subArray);
            subArray = [];
        }
        subArray.push(bitmapBuffer.readUInt8(i));
    }
    pixelArray.push(subArray);
    pixelArray.reverse();
    return pixelArray;
};

const getCaptcha = function (image) {

    let vals = captchaRes.vals;
    let order = captchaRes.order;


    //removal of pixel dots
    let temp = 0;
    for(let x=0; x<25; ++x){
        for(let y=0; y<132; ++y){
            temp = image[x][y];
            if(x!=0 && x!= 24){
                if(image[x+1][y] === 0 && temp === 1 && image[x-1][y] === 0){
                    image[x][y] = 0;
                }
            }
        }
    }


    // removal of horizontal lines

    let count = 0;
    let threshold = 115;
    for(let x=0; x<25; x++){
        for(let y=0; y<132; y++){
            if(image[x][y] == '1'){
                count += 1;
            }
            else {
                continue;
            }
        }
        if(count > threshold){
            for(let n=0; n<132; n++){
                image[x][n] = 0;
            }
        }
        count = 0;
    }




    //Matching bit values of the captcha and alphanumerics where img is the captcha buffer and mask is the character passed for matching

    const checkBits = function (startX, startY, img, mask) {

        let startFlag = 1;
        let stopFlag = 0;
        let count = 0;
        for(let x=0; x<mask.length; ++x){
            for(let y=0; y<mask[0].length; ++y){
                try{
                    if(mask[x][y] == '1'){
                        if(img[startX + x][startY + y] == '1'){
                            count += 1;
                        }
                        else {
                            startFlag = 0;
                            stopFlag = 1;
                            break;
                        }
                    }

                }
                catch(e){
                    startFlag = 0;
                    stopFlag = 1;
                    break;
                }
            }
            if(stopFlag){
                break;
            }
        }
        if(count === 0){
            startFlag = 0;
        }

        return startFlag;


    };

    //Skipping characters already recognized

    const skip = function (start, end, y) {
        let flag = 0;
        for(let i=0; i<start.length; ++i){
            if(y >= start[i] && y <= end[i]){
                flag = 1;
                break;
            }
        }
        return flag;

    };

    // sorting the captcha characters

    const sort = function (sorter, captcha) {

        for(let i=0; i<sorter.length; ++i){
            let smaller = sorter[i];
            let swap = 0;
            let swapIndex = i;
            for(let j=i; j<sorter.length; j++){
                if(sorter[j]<smaller){
                    smaller = sorter[j];
                    swapIndex = j;
                    swap = 1;
                }
            }
            if(swap){
                let sorterTemp = sorter[i];
                sorter[i] = sorter[swapIndex];
                sorter[swapIndex] = sorterTemp;
                let captchaTemp = captcha[i];
                captcha[i] = captcha[swapIndex];
                captcha[swapIndex] = captchaTemp;
            }
        }

    };




    //Solving the captcha. Finally.

    let xOffset = 2;
    let yOffset = 2;
    const skipStart = [];
    const skipEnd = [];
    const sorter = [];
    const captcha = [];

    // 36 because 10 numbers + 26 alphabets
    for(let i=0; i<36; ++i){
        let mask = vals[order[i]];
        let no = 0;
        for(let x=xOffset; x<25; ++x){
            for(let y=yOffset; y<132; ++y){
                if(!(skip(skipStart, skipEnd, y))){
                    if(checkBits(x,y,image, mask)){
                        skipStart.push(y);
                        skipEnd.push(y + mask[0].length);
                        sorter.push(y);
                        captcha.push(order[i]);
                        no += 1;
                    }
                }
            }
        }

        // captcha always has 6 characters
        if(no == 6){
            break;
        }

    }

    sort(sorter, captcha);

    //captcha array to string
    let result = '';
    for(let i = 0; i<captcha.length; ++i){
        result = result + captcha[i];
    }

    return result;

};


module.exports.parseCaptcha = parseCaptcha;