const formatLinkAsText = (format, platformOs, linkUrl) => {
  const getLinkText = url => {
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

  const getFirstLinkInSelection = selection => {
    const getNextNode = (node, endNode) => {
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
    };

    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    const endNode = range.endContainer;
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
  };

  const formatURL = (format, url, pageUrl, title, selectedText) => {
    let text = '';
    let i = 0, len = format.length;

    const parseLiteral = str => {
      if (format.substr(i, str.length) === str) {
        i += str.length;
        return str;
      } else {
        return null;
      }
    };

    const parseString = () => {
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
    };

    const processVar = value => {
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
    };

    const newline = platformOs === 'win' ? '\r\n' : '\n';
    while (i < len) {
      if (parseLiteral('\\')) {
        if (parseLiteral('n')) {
          text += newline;
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

  const title = document.title;
  let text;
  let href = linkUrl;
  if (linkUrl) {
    text = getLinkText(href);
  }
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const selectionText = selection.toString().trim();
    if (!text && selectionText) {
      text = selectionText;
    }

    const hrefInSelection = getFirstLinkInSelection(selection);
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

  return formatURL(format, href, pageUrl, title, text);
};

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
    const textToCopy = formatLinkAsText(request.format, request.platformOs);
    copyToTheClipboard(textToCopy, request.asHTML).then(() => {
      sendResponse({ result: textToCopy });
    });
    return true;
  }
});
