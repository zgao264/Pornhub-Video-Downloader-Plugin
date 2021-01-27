function Func() {
	return new Promise((resolve, reject) => {
		var jsString = document.querySelector("#player >script:nth-child(2)")
		if (!jsString) {
			jsString = document.querySelector("#player >script:nth-child(1)")
		}
		jsString = jsString.innerHTML
		jsString = `	var playerObjList = {};\n${jsString}`
		var flashvars = jsString.match("flashvars_[0-9]{1,}")[0]
		eval(jsString)
		var jsObject = eval(flashvars)
		resolve(jsObject)
	})
}

Func().then(res => {
	var videoType = []
	Object.keys(res['mediaDefinitions']).forEach((item) => {
		var itemInfo = res['mediaDefinitions'][item]
		if (itemInfo['format'] == 'mp4') {
			var mp4UrlJson = getMp4Url(itemInfo['videoUrl']);
			for (const mp4Url of mp4UrlJson){
				var obj = {
				key: mp4Url['quality'],
				val: mp4Url['videoUrl'],
				video_title:res.video_title
				}
			videoType.push(obj)
			}
		}
	})
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.cmd == 'test') 
			sendResponse(videoType);
	});
})

function getMp4Url(url){
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url , false);
	xhr.onload = function(){
	if (xhr.readyState === 4 && xhr.status === 200){
		mp4UrlJson = JSON.parse(xhr.responseText);
	}};
	xhr.send();
	return mp4UrlJson;
}
