console.log(new Date() + " -> Initializing randomtube server ");

var express = require('express');
var app = express();
var http=require("http");
var bl=require('bl');
app.use(express.static(__dirname+'/public')); 



var host = process.env.VCAP_APP_HOST || 'localhost';
var port = process.env.VCAP_APP_PORT || 1337;

var videos=[];
//INIT
loadAllVideosFromBackend();

//LISTEN
var server = app.listen(port, function () {

var host = server.address().address
var port = server.address().port

console.log('RandomTube app listening at http://%s:%s', host, port)

})


//ROUTES
app.get('/getRandomVideo', function(req,res){
	res.writeHead(200, { 'content-type': 'text/plain' })
	res.end(getRandomVideo());
});


//LOAD VIDEOS FROM BACKEND


function loadAllVideosFromBackend(){
	videos=[];
	var pagesCount=(391489/20)-1;
	for (var page=0;page<pagesCount;page++){
		loadVideosFromBackendPage(page);
	}
}


function loadVideosFromBackendPage(page){
	try{
		var url="http://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&page="+page
		console.log("request videos to page "+ page);
		//console.log("url:"+url);
		var req = http.get(url, function(res) {	
	  		//console.log("Response Status: " + res.statusCode);
	  		res.pipe(bl(function (err, data) {
	  			try{
		  			if(err){
		  				console.error("error receiving data from backend "+ err);
		  			}
					//console.log("Data received:"+data)
					var videosResponse = JSON.parse(data);
					// count=videosResponse.count;
					var length=videosResponse.videos.length;
					// console.log("Video response count:"+count);
					for (var i=0;i<length;i++){
						videos.push(videosResponse.videos[i].video.video_id);
						// console.log("Added video id:"+videosResponse.videos[i].video.video_id);
						// console.log("Videos list size:"+videos.length);
					}
					console.log("Added videos from page:"+page);
					console.log("Videos list size:"+videos.length);
				}
				catch(error){
					return console.error("Exception retrieving data pipe from backend "+err);
				}
			}));
	  		
		});
	}
	catch(err){
		return console.error("Exception retrieving data from backend "+err);
	}
}


function getRandomVideo(){
	var lastIndex=videos.length-1;
	var randomIndex=getRandomInt(0, lastIndex);
	console.log("get random video - lasIndex:"+lastIndex+" randomIndex:"+randomIndex);
	return videos[randomIndex];

}

//UTIL
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
