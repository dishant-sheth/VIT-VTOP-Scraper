/**
 * Created by dishant on 21/6/17.
 */


exports.submit_url = 'https://vtop.vit.ac.in/student/stud_login_submit.asp';
exports.captcha_url = 'https://vtop.vit.ac.in/student/captcha.asp';
exports.student_home = 'https://vtop.vit.ac.in/student/stud_home.asp';
exports.student_base = 'https://vtop.vit.ac.in/student/stud_login.asp';
exports.spotlight = "https://vtop.vit.ac.in/student/include_spotlight.asp";
exports.profile_url = "https://vtop.vit.ac.in/student/profile_personal_view.asp";
exports.timetable = "https://vtop.vit.ac.in/student/course_regular.asp?sem=";
exports.marks = "https://vtop.vit.ac.in/student/marks.asp?sem=";
exports.attendance_overview_base = "https://vtop.vit.ac.in/student/attn_report.asp?sem=";
exports.attendance_overview_query1 = "&fmdt=";
exports.attendance_overview_query2 = "&todt=";
exports.attendance_details = "https://vtop.vit.ac.in/student/attn_report_details.asp";

exports.codes = {
    success:{
        message: 'Successful completion of task',
        code:200
    },
    captchaDownload : {
        message: 'Captcha could not be downloaded',
        code: 300
    },
    captchaParse : {
        message : 'Captcha could not be parsed',
        code : 400
    },
    invalidCredentials : {
        message : 'Your username or password is incorrect. Kindly reenter them.',
        code : 500
    },
    sessionTimedOut : {
        message: 'The current session has timed out.',
        code: 600
    },
    noData : {
        message : 'The requested data could not be found',
        code : 700
    },
    vitDown : {
        message : 'VIT servers are currently down. Kindly retry sometime later.',
        code : 800
    },
    maintenance : {
        message : 'Our servers are down for maintenance. Kindly bear with us.',
        code : 900
    },
    triesExceeded : {
        message : 'Number of tries exceeded. Kindly limit it below 10',
        code : 1000
    },
    incorrectInput : {
        message : 'The input given is incorrect.',
        code : 1100
    }
};
