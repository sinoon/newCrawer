var request = require('request');
var async   = require('async');
var icovn   = require('iconv-lite');
var cheerio = require('cheerio');

var logger = require('tracer').console({
    transport : function(data) {
        console.log(data.output);
        fs.open('./file.log', 'a', 0666, function(e, id) {
            fs.write(id, data.output+"\n", null, 'utf8', function() {
                fs.close(id, function() {
                });
            });
        });
    }
});


module.exports.get = function(id,callback){
	var count1 = 1;
	var datas = '';
	async.whilst(
	    function() { return count1 < 50 },
	    function(cb) {
	        get(id,count1,function(data){
	        	// console.log(data.length)
	        	if(data.length < 5)
	        	{
	        		count1 = 100;
	        		return setTimeout(cb, 1000);
	        	}
	        	datas += data +',';
	        	// logger.log(datas)
		        // console.log(count1++);
		        count1++;
		        setTimeout(cb, 1000);
	        })
	    },
	    function(err) {
	        // 3s have passed
	        // log('1.1 err: ', err);
	        datas = datas.substr(0,datas.length-1);//去掉多余的逗号
	        callback(datas);
	    }
	);
}

module.exports.test = function(id,type,page,callback){
	get(id,type,page,function(data){
		callback(data);
	})
}

/**
 * [get 获取指定比赛欧赔,页数，的数据
 * 由于澳客目前只有欧赔的数据是以ajax形式传输，其他数据是还是存放在页面中，所以还是需要另外再写函数获取
 * ]
 * @param  {[type]}   id       [比赛ID]
 * @param  {[type]}   page     [页数]
 * @param  {Function} callback [获取到的值,不带方括号]
 * @return {[type]}            [description]
 */
function get(id,page,callback){
	if(page == '1')
	{
		var url = 'http://www.okooo.com/soccer/match/'+id+'/odds/ajax/';
	}
	else
	{
		page -= 1;
		var url = 'http://www.okooo.com/soccer/match/'+id+'/odds/ajax/?page='+page+'&companytype=BaijiaBooks&type=0';
	}
	console.log('page:',page)
	var option = {
		url:url,
		method:'GET',
		// encoding:null,
		headers:{
			'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
				  'Accept':'text/html;q=0.9,*/*;q=0.8',
				  'Accept-Charset':'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
				  'Connection':'close',
				  'Referer':'None'
		}
	}

	request(option,function(err,res,body){
		var match = body.match('var data_str = \'(.*)\';')[1];
		match = match.substr(1,match.length-2);
		callback(match);
	});
}

module.exports.getAh = function (id,callback){
	var url = 'http://www.okooo.com/soccer/match/'+id+'/ah/';
	var option = {
		url:url,
		method:'GET',
		// encoding:null,
		headers:{
			'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
				  'Accept':'text/html;q=0.9,*/*;q=0.8',
				  'Accept-Charset':'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
				  'Connection':'close',
				  'Referer':'None'
		}
	}

	request(option,function(err,res,body){
		var match = body.match('var data_str=\'(.*)\';')[1];
		match = match.substr(1,match.length-2);
		// console.log(match)
		callback(match);
	});
}

module.exports.getOverunder = function (id,callback){
	var url = 'http://www.okooo.com/soccer/match/'+id+'/overunder/';
	var option = {
		url:url,
		method:'GET',
		// encoding:null,
		headers:{
			'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
				  'Accept':'text/html;q=0.9,*/*;q=0.8',
				  'Accept-Charset':'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
				  'Connection':'close',
				  'Referer':'None'
		}
	}

	request(option,function(err,res,body){
		var match = body.match('var data_str=\'(.*)\';')[1];
		match = match.substr(1,match.length-2);
		// console.log(match)
		callback(match);
	});
}

module.exports.findTime = function(times,time){
	for (var i = times.length - 1 ; i >= 0; i--) {
		if( time <= times[i]['Time'] )
		{
			// console.log(i,times[i]['Time']);
			// console.log(i,times[i]['Change'][0]);
			// console.log(i,times[i]['Change'][1]);
			// console.log(i,times[i]['Change'][2]);
			return times[i]['Change'];
			break;
		}
		// console.log(odds[i]['Time'])
	};

	return times[times.length-1]['Change'];
}

module.exports.findTimeAndBoundary = function(times,time){
	for (var i = times.length - 1 ; i >= 0; i--) {
		if( time <= times[i]['Time'] )
		{
			// console.log(i,times[i]['Time']);
			// console.log(i,times[i]['Change'][0]);
			// console.log(i,times[i]['Change'][1]);
			// console.log(i,times[i]['Change'][2]);
			var a   = times[i]['Change'];
			var b   = times[i]['boundary'];
			var res = Array(a,b);
			// console.log(times[i]['boundary'])
			// res.push(times[i]['boundary']);
			// res.push(times[i]['Boundary']);
			// console.log(res[1])
			// console.log(times.length)
			return res;
			break;
		}
		// console.log(odds[i]['Time'])
	};
	// console.log(times.length)
	var a   = times[times.length-1]['Change'];
	var b   = times[times.length-1]['boundary'];
	var res = Array(a,b);
	return res;
}


module.exports.getTime = function (time){
	var month,
		date,
		hour,
		minute;

	month = time.getMonth() + 1;
	date  = time.getDate();
	hour  = time.getHours();
	minute= time.getMinutes();

	if(month < 10)
	{
		month = '0' + month
	}

	if( date < 10 )
	{
		date = '0' + date;
	}

	if( hour < 10 )
	{
		hour = '0' + hour;
	}

	if( minute < 10 )
	{
		minute = '0' + minute;
	}
	// if(month.length < 2)

	return month + '\/' + date + ' ' + hour + ':' + minute;
}

module.exports.avgodds = function (data,endtime){
	var hodd = 0,
		dodd = 0,
		aodd = 0;

	var start = new Date(endtime);
	start.setHours(start.getHours() - 12)

	var time = new Date(start);

	var res = []

	for (var i = 72; i >= 0; i--) {
		// console.log(base.getTime(time))
		time.setMinutes(time.getMinutes() + 10);
		// console.log(time)
		times = this.getTime(time);
		for (var ii = 1; ii < data.length; ii++) {
			hodd = Number(hodd)
			dodd = Number(dodd)
			aodd = Number(aodd)
			var odds = data[ii]['spchangeHometeam'];
			// log(odds)
			var re  = this.findTime(odds,times);
			// console.log(res)
			hodd = (Number(hodd) + Number(re[0])).toFixed(3)
			dodd = (Number(dodd) + Number(re[1])).toFixed(3)
			aodd = (Number(aodd) + Number(re[2])).toFixed(3)
			// console.log(hodd,dodd,aodd)
		};
		
		res.push({
				'Time':times,
				'H':(hodd/(data.length -1)).toFixed(3),
				'D':(dodd/(data.length -1)).toFixed(3),
				'A':(aodd/(data.length -1)).toFixed(3)
			})
		hodd = dodd = aodd = 0;
		// time = new Date(time)
	};
	return res;
}

module.exports.maxodds = function (data,endtime){
	var hodd = 0,
		dodd = 0,
		aodd = 0;

	var start = new Date(endtime);
	start.setHours(start.getHours() - 12)

	var time = new Date(start);

	var res = []

	var maxhodd = 0,
		maxdodd = 0,
		maxaodd = 0;
	for (var i = 72; i >= 0; i--) {
		// console.log(base.getTime(time))
		time.setMinutes(time.getMinutes() + 10);
		// console.log(time)
		times = this.getTime(time);
		for (var ii = 1; ii < data.length; ii++) {
			hodd = Number(hodd)
			dodd = Number(dodd)
			aodd = Number(aodd)
			var odds = data[ii]['spchangeHometeam'];
			// log(odds)
			var re  = this.findTime(odds,times);
			// console.log(res)
			// maxhodd = (Number(hodd) + Number(re[0])).toFixed(3)
			// maxdodd = (Number(dodd) + Number(re[1])).toFixed(3)
			// maxaodd = (Number(aodd) + Number(re[2])).toFixed(3)
			if( Number(re[0]) > maxhodd )
			{
				maxhodd = re[0];
			}
			if( Number(re[1]) > maxdodd )
			{
				maxdodd = re[1];
			}
			if( Number(re[2]) > maxaodd )
			{
				maxaodd = re[2];
			}
			// console.log(maxhodd,maxdodd,maxaodd)
		};
		
		res.push({
				'Time':times,
				'H':maxhodd,
				'D':maxdodd,
				'A':maxaodd
			})
		// maxhodd = maxdodd = maxaodd = 0;
		// time = new Date(time)
	};
	return res;
}


module.exports.ah = function (data,endtime){
	var boundary = 0,
		up = 0,
		down = 0;

	var start = new Date(endtime);
	start.setHours(start.getHours() - 12)

	var time = new Date(start);

	var res = []

	for (var i = 72; i >= 0; i--) {
		// console.log(base.getTime(time))
		time.setMinutes(time.getMinutes() + 10);
		// console.log(time)
		times = this.getTime(time);
		for (var ii = 1; ii < data.length; ii++) {
			// up = Number(up)
			// boundry = Number(boundary)
			// down = Number(down)
			var ah = data[ii]['spchangeHometeam'];
			// log(odds)

			var re  = this.findTimeAndBoundary(ah,times);
			// console.log(Number(re[0][0]))
			boundary = (Number(boundary) + Number(re[1])).toFixed(3)
			up = (Number(up) + Number(re[0][0])).toFixed(3)
			down = (Number(down) + Number(re[0][1])).toFixed(3)
			// console.log(hodd,dodd,aodd)
		};
			// console.log((boundary/(data.length -1)).toFixed(3))
			// console.log(up)
		
		res.push({
				'Time':times,
				'up':(up/(data.length -1)).toFixed(3),
				'boundary':(boundary/(data.length -1)).toFixed(3),
				'down':(down/(data.length -1)).toFixed(3)
			})
		// console.log(res)
		up = down = boundary = 0;
		// time = new Date(time)
	};
	return res;
}

module.exports.overunder = function (data,endtime){
	var boundary = 0,
		up = 0,
		down = 0;

	var start = new Date(endtime);
	start.setHours(start.getHours() - 12)

	var time = new Date(start);

	var res = []

	for (var i = 72; i >= 0; i--) {
		// console.log(base.getTime(time))
		time.setMinutes(time.getMinutes() + 10);
		// console.log(time)
		times = this.getTime(time);
		for (var ii = 1; ii < data.length; ii++) {
			up = Number(up)
			boundry = Number(boundary)
			down = Number(down)
			var ah = data[ii]['spchangeHometeam'];
			// log(odds)

			if(ii == 29)
			{
				console.log(data[ii])
			}
			var re  = this.findTimeAndBoundary(ah,times);
			// console.log(Number(re[2]))
			boundary = (Number(boundry) + Number(re[1])).toFixed(3)
			up = (Number(up) + Number(re[0][0])).toFixed(3)
			down = (Number(down) + Number(re[0][1])).toFixed(3)
			// console.log(hodd,dodd,aodd)
		};
			// console.log((boundary/(data.length -1)).toFixed(3))
		
		res.push({
				'Time':times,
				'up':(up/(data.length -1)).toFixed(3),
				'boundary':(boundary/(data.length -1)).toFixed(3),
				'down':(down/(data.length -1)).toFixed(3)
			})
		up = down = boundary = 0;
		// time = new Date(time)
	};
	return res;
}

module.exports.startTime = function (id,callback){
	var url = 'http://www.okooo.com/soccer/match/'+id+'/overunder/';
	var option = {
		url:url,
		method:'GET',
		// encoding:null,
		headers:{
			'User-Agent':'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
				  'Accept':'text/html;q=0.9,*/*;q=0.8',
				  'Accept-Charset':'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
				  'Connection':'close',
				  'Referer':'None'
		}
	}

	request(option,function(err,res,body){
		$ = cheerio.load(body)

		var time = $('div.qbox').find('.qbox_1').find('.qbx_2').find('p').html();

		// console.log($('div.qbox').html())

		time = time.replace('&#xA0;',' ');

		callback(time);
	});
}