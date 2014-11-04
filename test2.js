var base = require('./base');

base.startTime('717198',function(time){
	time = time.substr(3).replace('-','/');
	console.log(time);
})