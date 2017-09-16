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

gettingOptions(options => {
  createContextMenus(options);

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("format-link-format")) {
      getSelectedText(selection => {
        gettingOptions(options => {
          var formatID = info.menuItemId.substr("format-link-format".length);
          if (formatID === "-default") {
            formatID = options["defaultFormat"];
          }
          var format = options['format' + formatID];
          var url = info.linkUrl ? info.linkUrl : info.pageUrl;
          var title = tab.title;
          if (info.linkUrl && !selection) {
            getLinkText(info.linkUrl, text => {
              var formattedText = formatURL(format, url, title, text);
              copyToClipboard(formattedText);
            });
            return;
          }
          var text = selection;
          if (!text) {
            text = info.selectionText ? info.selectionText : tab.title;
          }
          var formattedText = formatURL(format, url, title, text);
          copyToClipboard(formattedText);
        });
      });
    }
  });
});
