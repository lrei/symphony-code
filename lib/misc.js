module.exports = new function() {

	// support functions for parsing new tweets
	var months = {};
	months["Jan"] = 1; months["Feb"] = 2; months["Mar"] = 3; months["Apr"] = 4;
	months["May"] = 5; months["Jun"] = 6; months["Jul"] = 7; months["Aug"] = 8;
	months["Sep"] = 9; months["Oct"] = 10; months["Nov"] = 11; months["Dec"] = 12;

	var _parseTwitterTime = function (a) { return (a < 10) ? ("0" + a) : a; }
	
	this.parseDate = function(date_str) {
        // parse date
        var date_part = date_str.split(' ');
        var year = parseInt(date_part[3]);
        var month = months[date_part[2]];
        var day = parseInt(date_part[1]);
        // prase time
        var time_part = date_part[4].split(':');
        var hour = parseInt(time_part[0]);
        var minute = parseInt(time_part[1]);
        var second = parseInt(time_part[2]);
        // return qminer time string
        var parse_str = year + "-" +
            _parseTwitterTime(month) + "-" +
            _parseTwitterTime(day) + "T" +
            _parseTwitterTime(hour) + ":" +
            _parseTwitterTime(minute) + ":" +
            _parseTwitterTime(second);
		return parse_str;
    };
}