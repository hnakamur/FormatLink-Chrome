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

async function saveDefaultFormat(format) {
  await chrome.storage.sync.set({defaultFormat: format});
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
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const newline = chrome.runtime.PlatformOs === 'win' ? '\r\n' : '\n';
  const injectionResults = await chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: FormatLink_formatLinkAsText,
      args: [format, newline],
    }
  );
  const formattedText = injectionResults[0].result;
  await chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: FormatLink_copyTextToClipboard,
      args: [formattedText, asHTML],
    },
  );
  return formattedText;
}

function onContextMenuClicked(format) {
  console.log('context menu is clicked, format=', format);
}

async function createContextMenus(options) {
  await chrome.contextMenus.removeAll();
  if (options.createSubmenus) {
    let promises = [];
    const count = getFormatCount(options);
    for (let i = 0; i < count; i++) {
      const format = options['title' + (i + 1)];
      const asHTML = options['html' + (i + 1)];
      promises[i] = chrome.contextMenus.create({
        id: "format-link-format" + (i + 1),
        title: "as " + format,
        contexts: ['all'],
        // onclick: (info, tab) => {
        //   chrome.scripting.executeScript(
        //     {
        //       // target: { tabId: tab.id },
        //       function: FormatLink_copyTextToClipboard,
        //       args: ["hello", false],
        //     },
        //   );          
        //   // await copyLinkToClipboard(format, asHTML);
        // //   chrome.action.setBadgeText({text: 'hi'});
        // //   // chrome.scripting.executeScript(
        // //   //   {
        // //   //     function: onContextMenuClicked,
        // //   //     args: [format],
        // //   //   },
        // //   // );
        
        // }
      });
    }
    await Promise.all(promises);
  } else {
    const defaultFormat = options['title' + options['defaultFormat']];
    await chrome.contextMenus.create({
      id: "format-link-format-default",
      title: "Format Link as " + defaultFormat,
      contexts: ['all']
    });
  }
}



function contextClick(info, tab) {
  // chrome.action.openPopup();
  chrome.action.setBadgeText({text: 'hi'});
  // chrome.scripting.executeScript(
  //   {
  //     target: { tabId: tab.id },
  //     function: FormatLink_copyTextToClipboard,
  //     args: ['hello', false],
  //   },
  // );  
  // chrome.scripting.executeScript(
  //   {
  //     function: onContextMenuClicked,
  //     args: ['format1'],
  //   },
  // );

  // await copyLinkToClipboard('HTML', true);
  // const { menuItemId } = info

  // if (menuItemId === 'foo') {
  //   // do something
  // }
}

chrome.contextMenus.onClicked.addListener(contextClick);
