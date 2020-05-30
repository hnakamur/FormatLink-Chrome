const FORMAT_MAX_COUNT = 9;

const DEFAULT_OPTIONS = {
  "defaultFormat": 1,
  "title1": "Markdown",
  "format1": "[{{text.s(\"\\\\[\",\"\\\\[\").s(\"\\\\]\",\"\\\\]\")}}]({{url.s(\"\\\\(\",\"%28\").s(\"\\\\)\",\"%29\")}})",
  "html1": 0,
  "title2": "reST",
  "format2": "`{{text}} <{{url}}>`_",
  "html2": 0,
  "title3": "Text",
  "format3": "{{text}}\\n{{url}}",
  "html3": 0,
  "title4": 'HTML',
  "format4": "<a href=\"{{url.s(\"\\\"\",\"&quot;\")}}\">{{text.s(\"<\",\"&lt;\")}}</a>",
  "html4": 1,
  "title5": "LaTeX",
  "format5": "\\\\href\\{{{url}}\\}\\{{{text}}\\}",
  "html5": 0,
  "title6": "",
  "format6": "",
  "html6": 0,
  "title7": "",
  "format7": "",
  "html7": 0,
  "title8": "",
  "format8": "",
  "html8": 0,
  "title9": "",
  "format9": "",
  "html9": 0,
  "createSubmenus": false
};

async function gettingOptions() {
  return await new Promise((resolve, reject) => {
    chrome.storage.sync.get(DEFAULT_OPTIONS, items => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
}

function getFormatCount(options) {
  let i;
  for (i = 1; i <= 9; ++i) {
    const optTitle = options['title' + i];
    const optFormat = options['format' + i];
    if (optTitle === '' || optFormat === '') {
      break;
    }
  }
  return i - 1;
}

async function copyLinkToClipboard(format, asHTML, linkUrl, linkText) {
  try {
    const results = await chrome.tabs.executeScript({
      code: "typeof FormatLink_copyLinkToClipboard === 'function';",
    });
    // The content script's last expression will be true if the function
    // has been defined. If this is not the case, then we need to run
    // clipboard-helper.js to define function copyToClipboard.
    if (!results || results[0] !== true) {
      await chrome.tabs.executeScript({
        file: "clipboard-helper.js",
      });
    }
    // clipboard-helper.js defines functions FormatLink_formatLinkAsText
    // and FormatLink_copyLinkToClipboard.
    const newline = chrome.runtime.PlatformOs === 'win' ? '\r\n' : '\n';

    let code = 'FormatLink_formatLinkAsText(' + JSON.stringify(format) + ',' +
      JSON.stringify(newline) + ',' +
      (linkUrl ? JSON.stringify(linkUrl) + ',' : '') +
      (linkText ? JSON.stringify(linkText) + ',' : '') +
      ');';
    const result = await chrome.tabs.executeScript({code});
    const formattedText = result[0];

    code = 'FormatLink_copyTextToClipboard(' + JSON.stringify(formattedText) + ',' +
      asHTML + ');';
    await chrome.tabs.executeScript({code});

    return formattedText;
  } catch (err) {
    // This could happen if the extension is not allowed to run code in
    // the page, for example if the tab is a privileged page.
    console.error('Failed to copy text: ' + err);
    alert('Failed to copy text: ' + err);
  }
}

async function createContextMenus(options) {
  await chrome.contextMenus.removeAll();
  if (options.createSubmenus) {
    let promises = [];
    const count = getFormatCount(options);
    for (let i = 0; i < count; i++) {
      const format = options['title' + (i + 1)];
      promises[i] = chrome.contextMenus.create({
        id: "format-link-format" + (i + 1),
        title: "as " + format,
        contexts: ["all"]
      });
    }
    await Promise.all(promises);
  } else {
    const defaultFormat = options['title' + options['defaultFormat']];
    await chrome.contextMenus.create({
      id: "format-link-format-default",
      title: "Format Link as " + defaultFormat,
      contexts: ["all"]
    });
  }
}
