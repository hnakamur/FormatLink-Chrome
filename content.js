const copyToTheClipboard = (textToCopy, asHTML) => {
    return new Promise((resolve, reject) => {
        const oncopy = event => {
            document.removeEventListener("copy", oncopy, true);
            event.stopImmediatePropagation();
            event.preventDefault();
            try {
                event.clipboardData.setData("text/plain", textToCopy);
                if (asHTML) {
                    event.clipboardData.setData("text/html", textToCopy);
                }
                resolve();
            } catch (e) {
                reject(e);
            }
        }
        document.addEventListener("copy", oncopy, true);
        document.execCommand("copy");
    });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "copyLink") {
        copyToTheClipboard(request.textToCopy, request.asHTML).then(() => {
            sendResponse({ result: request.textToCopy });
        });
        return true;
    }
});
