let obj = null;
for (const key in window) {
  if (/flashvars_\d+/.test(key)) {
    obj = window[key];
    break;
  }
}
window.postMessage({type: "get-ph-flashvars", data: obj});
