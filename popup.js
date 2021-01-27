function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
            if (callback) callback(response);
        });
    });
}
sendMessageToContentScript({ cmd: 'test', value: 'test' }, function (videoType) {
    if(videoType == null) return 
    var boxEl = document.getElementsByTagName('ul')[0]
    var videoStr = ''
    videoType.forEach((item) => {
        videoStr += `<li> <label>清晰度：<span> ${item.key} </span> </label> <button class="button down">下载</button> <button class="button copy">复制</button></li>`
    });
    boxEl.innerHTML = videoStr
    var dialog = document.getElementsByTagName("dialog")[0]
    var dialog1 = document.getElementsByTagName("dialog")[1]
    var downList = document.querySelectorAll(".down")
    downList.forEach((item, index) => {
        item.onclick = () => {
            let reg =  /[\~\.\:\/\*\?\"\|\\\<\>]/g
            chrome.downloads.download({
                url: videoType[index].val,
                filename: videoType[index].video_title.replace(reg, '') + ".mp4"
            })
            dialog1.showModal();
            setTimeout(() => {
                dialog1.close();
            }, 2000)
        }
    })

    var copyList = document.querySelectorAll(".copy")
    copyList.forEach((item, index) => {
        item.onclick = () => {
            var url = videoType[index].val
            var oInput = document.createElement('input');
            oInput.value = url;
            document.body.appendChild(oInput);
            oInput.select();
            document.execCommand("Copy");
            oInput.className = 'oInput';
            oInput.style.display = 'none';
            dialog.showModal();
            setTimeout(() => {
                dialog.close();
            }, 1500)
        }
    })
});