'use strict';

const FORMAT_MAX_COUNT = 9;

const DEFAULT_OPTIONS = {
  "defaultFormat": 1,
  "title1": 'HTML',
  "format1": "<a href=\"{{url.s(\"\\\"\",\"&quot;\")}}\">{{text.s(\"<\",\"&lt;\")}}</a>",
  "html1": 1,
  "title2": "Markdown",
  "format2": "[{{text.s(\"\\\\[\",\"\\\\[\").s(\"\\\\]\",\"\\\\]\")}}]({{url.s(\"\\\\(\",\"%28\").s(\"\\\\)\",\"%29\")}})",
  "html2": 0,
  "title3": "Text",
  "format3": "{{text}}\\n{{url}}",
  "html3": 0,
  "title4": "reST",
  "format4": "`{{text}} <{{url}}>`_",
  "html4": 0,
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
  "createSubmenus": true
};

const getFormatCount = options => {
  let i;
  for (i = 1; i <= 9; ++i) {
    const optTitle = options['title' + i];
    const optFormat = options['format' + i];
    if (optTitle === '' || optFormat === '') {
      break;
    }
  }
  return i - 1;
};

const getDefaultOptions = () => {
  const options = DEFAULT_OPTIONS;
  const count = getFormatCount(options);
  return { ...options, count, maxCount: FORMAT_MAX_COUNT };
};

const getOptions = async () => {
  const options = await chrome.storage.sync.get(DEFAULT_OPTIONS);
  const count = getFormatCount(options);
  return { ...options, count, maxCount: FORMAT_MAX_COUNT };
};

const createContextMenus = async options => {
  await chrome.contextMenus.removeAll();
  if (options.createSubmenus) {
    let promises = [];
    for (let i = 0; i < options.count; i++) {
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
};

// NOTE: We use callback here since the return value of sendMessage called in
// popup.js becomes undefined if we use async/await.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'getOptions') {
    getOptions().then(options => {
      sendResponse({ options });
    });
  } else if (request.message === 'getDefaultOptions') {
    const options = getDefaultOptions();
    sendResponse({ options });
  } else if (request.message === 'updateDefaultFormat') {
    chrome.storage.sync.set({ defaultFormat: request.formatID }).then(() => {
      getOptions().then(options => {
        createContextMenus(options).then(() => {
          sendResponse({});
        })
      })
    })
  } else if (request.message === 'createContextMenus') {
    createContextMenus(request.options).then(() => {
      sendResponse({});
    });
  }
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  const options = await getOptions();
  await createContextMenus(options);
});

const menuItemIdPrefix = 'format-link-format';
const menuItemIdDefault = 'format-link-format-default';

const copyLink = async (menuItemId, linkUrl, linkText) => {
  const options = await getOptions();
  const formatID = menuItemId === menuItemIdDefault ?
    options.defaultFormat : menuItemId.substr(menuItemIdPrefix.length);
  const format = options['format' + formatID];
  const asHTML = options['html' + formatID];

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tabs[0].id, {
    message: "copyLink",
    format,
    asHTML,
    platformOs: chrome.runtime.PlatformOs,
    linkUrl,
    linkText,
  });
};

chrome.contextMenus.onClicked.addListener((item, tab) => {
  const menuItemId = item.menuItemId;
  if (menuItemId.startsWith(menuItemIdPrefix)) {
    console.log('linkUrl=', item.linkUrl, ', linkText=', item.linkText);
    copyLink(menuItemId, item.linkUrl, item.linkText);
  }
});

chrome.commands.onCommand.addListener(command => {
  if (command.startsWith(menuItemIdPrefix)) {
    copyLink(command);
  }
});
