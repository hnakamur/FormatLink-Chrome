async function saveDefaultFormat(format) {
  await chrome.storage.sync.set({defaultFormat: format});
}

(async function() {
  chrome.commands.onCommand.addListener(async (command) => {
    try {
      const prefix = 'copy-link-in-format';
      if (command.startsWith(prefix)) {
        let formatID = command.substr(prefix.length);
        const options = await gettingOptions();
        const format = options['format' + formatID];
        await copyLinkToClipboard(format);
      }
    } catch (err) {
      console.error("FormatLink extension failed to copy URL to clipboard.", err);
    }
  });

  try {
    chrome.commands.onCommand.addListener(async (command) => {
      if (command === "copy-link-to-clipboard") {
        const options = await gettingOptions();
        const formatID = options.defaultFormat;
        const format = options['format' + formatID];
        copyLinkToClipboard(format);
      }
    });

    const options = await gettingOptions();
    await createContextMenus(options);
    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId.startsWith("format-link-format")) {
        try {
          const options = await gettingOptions();
          let formatID = info.menuItemId.substr("format-link-format".length);
          if (formatID === "-default") {
            formatID = options.defaultFormat;
          }
          const format = options['format' + formatID];
          await copyLinkToClipboard(format, info.linkUrl);
        } catch (err) {
          console.error("FormatLink extension failed to copy URL to clipboard.", err);
        }
      }
    });

    async function handleMessage(request, sender, sendResponse) {
      if (request.messageID === 'update-default-format') {
        const formatID = request.formatID;
        await saveDefaultFormat(formatID);

        const options = await gettingOptions();
        const defaultFormat = options['title' + request.formatID];
        await chrome.contextMenus.update(
          "format-link-format-default",
          { title: "Format Link as " + defaultFormat });
        sendResponse({response: 'default format updated'});
      } else {
        sendResponse({response: 'invalid messageID'});
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage);
  } catch (err) {
    console.error("failed to create context menu", err);
  };
})();
