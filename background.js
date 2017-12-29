async function copyToClipboard(text) {
  return await new Promise((resolve, reject) => {
    function oncopy(event) {
      document.removeEventListener("copy", oncopy, true);
      // Hide the event from the page to prevent tampering.
      event.stopImmediatePropagation();

      // Overwrite the clipboard content.
      event.preventDefault();
      event.clipboardData.setData("text/plain", text);
      resolve();
    }
    document.addEventListener("copy", oncopy, true);

    // Requires the clipboardWrite permission, or a user gesture:
    document.execCommand("copy");
  });
}

async function getLinkText(url) {
  var results = await chrome.tabs.executeScript({
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
  });
  return results[0];
}

async function getSelectedText() {
  var selection = await chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
  });
  var text;
  if (selection && selection[0]) {
    text = selection[0].trim().replace(/\s+/g, ' ');
  }
  return text;
}

(async function() {
  try {
    const platformInfo = await chrome.runtime.getPlatformInfo();
    const isWindows = platformInfo.os === 'win';
    var options = await gettingOptions();
    await createContextMenus(options);
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId.startsWith("format-link-format")) {
        try {
          var options = await gettingOptions();
          var formatID = info.menuItemId.substr("format-link-format".length);
          if (formatID === "-default") {
            formatID = options.defaultFormat;
          }
          var format = options['format' + formatID];
          var url = info.linkUrl ? info.linkUrl : info.pageUrl;
          var title = tab.title;
          var text = await getSelectedText();
          if (!text) {
            if (info.linkUrl) {
              text = await getLinkText(info.linkUrl);
            } else {
              text = title;
            }
          }
          var formattedText = formatURL(format, url, title, text, isWindows);
          await chrome.storage.local.set({
            lastCopied: {
              url: url,
              title: title,
              text: text,
              formattedText: formattedText
            }
          });
          await copyToClipboard(formattedText);
          if (formatID !== options.defaultFormat) {
            await saveDefaultFormat(formatID);
          }
        } catch (err) {
          console.error("FormatLink extension failed to copy URL to clipboard.", err);
        }
      }
    });
  } catch (err) {
    console.error("failed to create context menu", err);
  };
})();
