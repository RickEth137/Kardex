console.log("Background loaded");chrome.runtime.onMessage.addListener((o,s,e)=>{e({status:"ok"})});
