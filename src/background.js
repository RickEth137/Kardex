console.log('Background loaded');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  sendResponse({ status: 'ok' });
});
