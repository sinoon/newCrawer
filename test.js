var base = require('./base');
var log =require('tracer').console().log
var fs = require('fs');
var xlsx = require('node-xlsx');

// var logger = require('tracer').console({
//     transport : function(data) {
//         console.log(data.output);
//         fs.open('./file.log', 'a', 0666, function(e, id) {
//             fs.write(id, data.output+"\n", null, 'utf8', function() {
//                 fs.close(id, function() {
//                 });
//             });
//         });
//     }
// });

var id = '717198'

console.log(id)
base.get(id,function(data){
	data = eval('['+data+']')
	var time = new Date();


	// var avgodd = base.avgodds(data,base.getTime(time));
	// var maxodd = base.maxodds(data,base.getTime(time));
	var avgodd = base.avgodds(data,'11/04 04:00');
	var maxodd = base.maxodds(data,'11/04 04:00');
	// console.log(avgodd)
	base.getAh(id,function(data){
		data = eval('['+data+']');
		var ah     = base.ah(data,base.getTime(time));
		var ah     = base.ah(data,'11/04 04:00');

		for (var i = avgodd.length - 1; i >= 0; i--) {
			// console.log(avgodd[i]['H'])
			avgodd[i]['H'] = Number(avgodd[i]['H']);
			avgodd[i]['D'] = Number(avgodd[i]['D']);
			avgodd[i]['A'] = Number(avgodd[i]['A']);
			maxodd[i]['H'] = Number(maxodd[i]['H']);
			maxodd[i]['D'] = Number(maxodd[i]['D']);
			maxodd[i]['A'] = Number(maxodd[i]['A']);
		};

		//处理部分
		var col1 = [],col2 = [],col3 = [];
		for (var i = ah.length - 1; i >= 0; i--) {
			col1[i] = avgodd[i]['H'] - avgodd[i]['D'] + maxodd[i]['H'] - maxodd[i]['D'];
			col2[i] = avgodd[i]['D'] - avgodd[i]['A'] + maxodd[i]['D'] - maxodd[i]['A'];
			col3[i] = ah[i]['up'] - ah[i]['boundary'] - ah[i]['down'];
		};

		var h = [],d = [],a = [];
		for (var i = ah.length - 1; i > 0; i--) {
			h[i] = (Number(col1[i]) - Number(col1[i-1])).toFixed(3);
			d[i] = (Number(col2[i]) - Number(col2[i-1])).toFixed(3);
			a[i] = (Number(col3[i]) - Number(col3[i-1])).toFixed(3);
		};

		// console.log(h[1])

		var hsum  = 0,
			hsum_ = 0,
			dsum  = 0,
			dsum_ = 0,
			asum  = 0,
			asum_ = 0;

		for (var i = h.length - 1; i > 0; i--) {
			if( Number(h[i]) > 0 )
			{
				hsum += Number(h[i]);
			}
			else
			{
				hsum_ += Number(h[i]);
			}

			if( Number(d[i]) > 0 )
			{
				dsum += Number(d[i]);
			}
			else
			{
				dsum_ += Number(d[i]);
			}

			if( Number(a[i]) > 0 )
			{
				asum += Number(a[i]);
			}
			else
			{
				asum_ += Number(a[i]);
			}
		};

		hsum_ = Number(hsum_).toFixed(3);
		dsum_ = Number(dsum_).toFixed(3);
		asum_ = Number(asum_).toFixed(3);		
		hsum = Number(hsum).toFixed(3);
		dsum = Number(dsum).toFixed(3);
		asum = Number(asum).toFixed(3);
		// console.log(hsum,hsum_,dsum,dsum_,asum,asum_)


		var zhu = (Number(hsum) + Number(hsum_)).toFixed(3);
		// console.log(zhu,hsum,hsum_)
		var ke  = (Number(dsum) + Number(dsum_)).toFixed(3);
		var ya  = (Number(asum) + Number(asum_)).toFixed(3);

		var zhuhe = eval(h.join('+'));
		var kehe  = eval(d.join('+'));
		var yahe  = eval(a.join('+'));

		var res = [];

		res.push([
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'',
			'主',
			'客',
			'亚'
		])

		res.push([
			'时间',
			'平均 主胜',
			'平均 平局',
			'平均 主负',
			// '时间',
			'最大值 主胜',
			'最大值 平局',
			'最大值 主负',
			'亚盘 主',
			'盘口',
			'亚盘 负',
			'平负',
			'负',
			'未定',
			zhuhe,
			kehe,
			yahe
		]);

		res.push([
			avgodd[avgodd.length-1]['Time'],
			avgodd[avgodd.length-1]['H'],
			avgodd[avgodd.length-1]['D'],
			avgodd[avgodd.length-1]['A'],
			// res2[i]['Time'],
			maxodd[avgodd.length-1]['H'],
			maxodd[avgodd.length-1]['D'],
			maxodd[avgodd.length-1]['A'],
			//亚盘
			ah[avgodd.length-1]['up'],
			ah[avgodd.length-1]['boundary'],
			ah[avgodd.length-1]['down'],
			col1[avgodd.length-1],
			col2[avgodd.length-1],
			col3[avgodd.length-1],
			zhu,
			ke,
			ya
		])

		for (var i = avgodd.length - 2; i > 0; i--) {
			res.push([
				avgodd[i]['Time'],
				avgodd[i]['H'],
				avgodd[i]['D'],
				avgodd[i]['A'],
				// res2[i]['Time'],
				maxodd[i]['H'],
				maxodd[i]['D'],
				maxodd[i]['A'],
				//亚盘
				ah[i]['up'],
				ah[i]['boundary'],
				ah[i]['down'],
				col1[i],
				col2[i],
				col3[i],
				h[i],
				d[i],
				a[i]
				])
		};

		var buffer = xlsx.build([{name: "mySheetName", data: res}]); // returns a buffer

		fs.writeFileSync( id +'.xlsx', buffer, 'binary');
	})
});


// base.getOverunder(id,function(data){
// 	data = eval('['+data+']')
// 	// console.log(data[0]['spchangeHometeam'][0]['Change'])
// 	var ah     = base.overunder(data,'11/01 23:30');
// 	console.log(ah)
// })