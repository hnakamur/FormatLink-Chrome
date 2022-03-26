// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
function FormatLink_copyTextToClipboard(text, asHTML) {
  function oncopy(event) {
    document.removeEventListener("copy", oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData("text/plain", text);
    if (asHTML) {
      event.clipboardData.setData("text/html", text);
    }
  }
  document.addEventListener("copy", oncopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand("copy");
}

function FormatLink_formatLinkAsText(format, newline, linkUrl) {
  function getLinkText(url) {
    // Limitation: If multiple links for the same URL exist in document,
    // the text of the first link is returned.
    // I wish there is a better way, but it's the best we can do now.

    const links = document.querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (link.href === url) {
        return link.innerText.trim();
      }
    }
    return '';
  }

  function getFirstLinkInSelection(selection) {
    function getNextNode(node, endNode) {
      if (node.firstChild) {
        return node.firstChild;
      }

      while (node) {
        if (node.nextSibling) {
          return node.nextSibling;
        }
        node = node.parentNode;
        if (node === endNode) {
          return node;
        }
      }
    }

    let range = selection.getRangeAt(0);
    let node = range.startContainer;
    let endNode = range.endContainer;
    for (; node; node = getNextNode(node, endNode)) {
      if (node.tagName === 'A') {
        return node.href;
      }

      if (node === endNode) {
        break;
      }
    }

    for (node = range.startContainer; node; node = node.parentNode) {
      if (node.tagName === 'A') {
        return node.href;
      }
    }
    return '';
  }

  function formatURL(format, pageUrl, url, title, selectedText, newline) {
    let text = '';
    let work;
    let i = 0, len = format.length;

    function parseLiteral(str) {
      if (format.substr(i, str.length) === str) {
        i += str.length;
        return str;
      } else {
        return null;
      }
    }

    function parseString() {
      let str = '';
      if (parseLiteral('"')) {
        while (i < len) {
          if (parseLiteral('\\')) {
            if (i < len) {
              str += format.substr(i++, 1);
            } else {
              throw new Error('parse error expected "');
            }
          } else if (parseLiteral('"')) {
            return str;
          } else {
            if (i < len) {
              str += format.substr(i++, 1);
            } else {
              throw new Error('parse error expected "');
            }
          }
        }
      } else {
        return null;
      }
    }

    function processVar(value) {
      let work = value;
      while (i < len) {
        if (parseLiteral('.s(')) {
          let arg1 = parseString();
          if (arg1 != null && parseLiteral(',')) {
            let arg2 = parseString();
            if (arg2 != null && parseLiteral(')')) {
              let regex = new RegExp(arg1, 'g');
              work = work.replace(regex, arg2);
            } else {
              throw new Error('parse error');
            }
          } else {
            throw new Error('parse error');
          }
        } else if (parseLiteral('}}')) {
          text += work;
          return;
        } else {
          throw new Error('parse error');
        }
      }
    }

    while (i < len) {
      if (parseLiteral('\\')) {
        if (parseLiteral('n')) {
          text += newline;
        //  isWindows ? "\r\n" : "\n";
        } else if (parseLiteral('t')) {
          text += "\t";
        } else {
          text += format.substr(i++, 1);
        }
      } else if (parseLiteral('{{')) {
        if (parseLiteral('title')) {
          processVar(title);
        } else if (parseLiteral('url')) {
          processVar(url);
        } else if (parseLiteral('pageUrl')) {
          processVar(pageUrl);
        } else if (parseLiteral('text')) {
          processVar(selectedText ? selectedText : title);
        }
      } else {
        text += format.substr(i++, 1);
      }
    }
    return text;
  }

  let title = document.title;
  let text;
  let href = linkUrl;
	if (linkUrl) {
    text = getLinkText(href);
	}
  let selection = window.getSelection();
  if (selection.rangeCount > 0) {
    let selectionText = selection.toString().trim();
    if (!text && selectionText) {
      text = selectionText;
    }

    let hrefInSelection = getFirstLinkInSelection(selection);
    if (!href && hrefInSelection) {
      href = hrefInSelection;
    }
  }
  if (!text) {
    text = title;
  }
  const pageUrl = window.location.href;
  if (!href) {
    href = pageUrl;
  }

  return formatURL(format, pageUrl, href, title, text, newline);
}

async function copyLinkToClipboard(format, asHTML, linkUrl, linkText) {
  console.log('background.js copyLinkToClipboard start');
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

async function saveDefaultFormat(format) {
  await chrome.storage.sync.set({defaultFormat: format});
}

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

const options = await gettingOptions();
await createContextMenus(options);

// console.log('hello from background.js');

// chrome.commands.onCommand.addListener((command) => {
//   console.log(`Command: ${command}`);
// });

(async function() {
  // chrome.commands.onCommand.addListener(async (command) => {
  //   try {
  //     const prefix = 'copy-link-in-format';
  //     if (command.startsWith(prefix)) {
  //       let formatID = command.substr(prefix.length);
  //       const options = await gettingOptions();
  //       const format = options['format' + formatID];
  //       const asHTML = options['html' + formatID];
  //       await copyLinkToClipboard(format, asHTML);
  //     }
  //   } catch (err) {
  //     console.error("FormatLink extension failed to copy URL to clipboard.", err);
  //   }
  // });

  try {
    chrome.commands.onCommand.addListener(async (command) => {
      if (command === "copy-link-to-clipboard") {
        const options = await gettingOptions();
        const formatID = options.defaultFormat;
        const format = options['format' + formatID];
        const asHTML = options['html' + formatID];
        copyLinkToClipboard(format, asHTML);
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
          const asHTML = options['html' + formatID];
          await copyLinkToClipboard(format, asHTML, info.linkUrl);
        } catch (err) {
          console.error("FormatLink extension failed to copy URL to clipboard.", err);
        }
      }
    });

  //   async function handleMessage(request, sender, sendResponse) {
  //     if (request.messageID === 'update-default-format') {
  //       const formatID = request.formatID;
  //       await saveDefaultFormat(formatID);

  //       const options = await gettingOptions();
  //       const defaultFormat = options['title' + request.formatID];
  //       await chrome.contextMenus.update(
  //         "format-link-format-default",
  //         { title: "Format Link as " + defaultFormat });
  //       sendResponse({response: 'default format updated'});
  //     } else {
  //       sendResponse({response: 'invalid messageID'});
  //     }
  //   }
  //   chrome.runtime.onMessage.addListener(handleMessage);
  } catch (err) {
    console.error("failed to create context menu", err);
  };
})();

