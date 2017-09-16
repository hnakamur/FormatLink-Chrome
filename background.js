function copyToClipboard(text) {
  function oncopy(event) {
    document.removeEventListener("copy", oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
  }
  document.addEventListener("copy", oncopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

function createContextMenus(options) {
  chrome.contextMenus.create({
    id: "format-link-format-default",
    title: "Format Link",
    contexts: ["link", "selection", "page"]
  });
}

function getLinkText(url, callback) {
  chrome.tabs.executeScript({
    code: `
      var links = document.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.href === "${url}") {
          text = link.innerText.trim();
          break
        }
      }
      text;
    `
  }, results => {
    callback(results[0]);
  });
}

function getSelectedText(callback) {
  chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  }, selection => {
    var text;
    if (selection && selection[0]) {
      text = selection[0].trim().replace(/\s+/g, ' ');
    }
    callback(text);
  });
}

gettingOptions(options => {
  createContextMenus(options);

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "format-link-format-default") {
      getSelectedText(selection => {
        gettingOptions(options => {
          var formatID = options["defaultFormat"];
          var format = options['format' + formatID];
          var url = info.linkUrl ? info.linkUrl : info.pageUrl;
          var title = tab.title;
          if (info.linkUrl && !selection) {
            getLinkText(info.linkUrl, text => {
              var formattedText = formatURL(format, url, title, text);
              chrome.storage.local.set({
                lastCopied: {
                  url: url,
                  title: title,
                  text: text,
                  formattedText: formattedText
                }
              }, () => {
                copyToClipboard(formattedText);
              });
            });
            return;
          }
          var text = selection;
          if (!text) {
            text = info.selectionText ? info.selectionText : tab.title;
          }
          var formattedText = formatURL(format, url, title, text);
					chrome.storage.local.set({
						lastCopied: {
							url: url,
							title: title,
							text: text,
              formattedText: formattedText
						}
					}, () => {
            copyToClipboard(formattedText);
          });
        });
      });
    }
  });
});
