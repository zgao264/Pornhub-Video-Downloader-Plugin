const injectScript = (filePath, tag) => {
	var node = document.getElementsByTagName(tag)[0]
	var script = document.createElement("script")
	script.setAttribute("type", "text/javascript")
	script.setAttribute("src", filePath)
	script.setAttribute("id", "inject")
	node.appendChild(script)
	return script
}

function Func() {
	return new Promise(async (resolve, reject) => {
		// pornhub
		const flashvars = await new Promise((resolve2) => {
			const handleMessage = async (event) => {
				if (event.data.type === "get-ph-flashvars") {
					resolve2(event.data.data)
					window.removeEventListener("message", handleMessage)
					script.remove()
				}
			}
			window.addEventListener("message", handleMessage)
			const script = injectScript(chrome.runtime.getURL("get-ph-flashvars.js"), "body")
		})
		if (flashvars) {
			resolve(flashvars)
			return
		}

		// xvideos
		var jsString = document.querySelector("#video-player-bg > script:nth-child(6)")
		if (jsString) {
			jsString = jsString.innerHTML
			console.log(jsString)
			var videoType = []
			var urlTitle = jsString.match(/setVideoTitle\('(.*?)'\);/)[1]
			var urlHLS = jsString.match(/setVideoHLS\('(.*?)'\);/)[1]
			if (urlHLS) {
				try {
					;(async () => {
						hls = await (await fetch(urlHLS)).text()
						const parser = new m3u8Parser.Parser()
						parser.push(hls)
						parser.end()
						const playlists = parser.manifest.playlists
						playlists.sort((a, b) => {
							return a.attributes.BANDWIDTH - b.attributes.BANDWIDTH
						})
						for (const item of playlists) {
							const obj = {
								key: item.attributes.NAME,
								val: urlHLS.replace("hls.m3u8", item.uri),
								video_title: urlTitle,
								type: "m3u8"
							}
							videoType.push(obj)
						}
						chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
							if (request.cmd == "test") sendResponse(videoType)
						})
					})()
					return
				} catch (error) {}
			}
			var urlLow = jsString.match(/setVideoUrlLow\('(.*?)'\);/)[1]
			if (urlLow){
				var obj ={
					key: "Low",
					val: urlLow,
					video_title: urlTitle
				}
				videoType.push(obj)
			}
			var urlHigh = jsString.match(/setVideoUrlHigh\('(.*?)'\);/)[1]
			if (urlHigh){
				var obj ={
					key: "High",
					val: urlHigh,
					video_title: urlTitle
				}
				videoType.push(obj)
			}
			chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
			if (request.cmd == 'test') 
				sendResponse(videoType);
			});
		}
	})
}

function getMp4Url(url){
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url , true);
        xhr.onload = function(){
            if (xhr.readyState === 4 && xhr.status === 200){
                mp4UrlJson = JSON.parse(xhr.responseText);
                resolve(mp4UrlJson);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.send();
    });
}

Func().then(res => {
	var videoType = []
	Object.keys(res['mediaDefinitions']).forEach((item) => {
		var itemInfo = res['mediaDefinitions'][item]
		if (itemInfo['format'] == 'mp4') {
			getMp4Url(itemInfo['videoUrl']).then(mp4UrlJson => {
				for (const mp4Url of mp4UrlJson){
					var obj = {
					key: mp4Url['quality'],
					val: mp4Url['videoUrl'],
					video_title:res.video_title
					}
				videoType.push(obj)
				}
			})
		}
	})
	chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.cmd == 'test') 
			sendResponse(videoType);
	});
});
