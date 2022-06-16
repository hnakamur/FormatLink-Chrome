const populateText = formattedText => {
  const textElem = document.getElementById('textToCopy');
  textElem.value = formattedText;
  textElem.focus();
  textElem.select();
};

const copyLink = (format, asHTML) => {
  chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
    chrome.tabs.sendMessage(tabs[0].id,
      {
        message: "copyLink",
        format,
        asHTML,
        platformOs: chrome.runtime.PlatformOs,
      }).then(response => {
        console.log('popup received response=', response);
        if (response) {
          populateText(response.result);
        }
      })
  });
};

const populateFormatGroup = options => {
  const defaultFormat = options.defaultFormat;
  const cnt = options.count;
  let group = document.getElementById('formatGroup');
  while (group.hasChildNodes()) {
    group.removeChild(group.childNodes[0]);
  }
  for (let i = 1; i <= cnt; ++i) {
    let radioId = 'format' + i;

    let btn = document.createElement('input');
    btn.setAttribute('type', 'radio');
    btn.setAttribute('name', 'fomrat');
    btn.setAttribute('id', radioId);
    btn.setAttribute('value', i);
    if (i == defaultFormat) {
      btn.setAttribute('checked', 'checked');
    }
    btn.addEventListener('click', async e => {
      const formatID = e.target.value;
      const format = options['format' + formatID];
      const asHTML = options['html' + formatID];
      console.log('onClick, format=', format, ', asHTML=', asHTML);
      copyLink(format, asHTML);
    });

    const optTitle = options['title' + i];
    const text = document.createTextNode(optTitle);

    let label = document.createElement('label');
    label.appendChild(btn);
    label.appendChild(text);

    group.appendChild(label);
  }
}

chrome.runtime.sendMessage({ message: "getOptions" }).then(response => {
  const options = response.options;
  if (response.options) {
    populateFormatGroup(options);
    const defaultFormat = options.defaultFormat;
    const format = options['format' + defaultFormat];
    const asHTML = options['html' + defaultFormat];
    copyLink(format, asHTML);
  }
});

const getSelectedFormatID = () => {
  for (let i = 1; ; ++i) {
    const radio = document.getElementById('format' + i);
    if (!radio) {
      break;
    }
    if (radio.checked) {
      return i;
    }
  }
  return undefined;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveDefaultFormatButton').addEventListener('click', () => {
    const formatID = getSelectedFormatID();
    if (formatID) {
      chrome.runtime.sendMessage({
        message: 'updateDefaultFormat',
        formatID
      });
    }
  });
});
