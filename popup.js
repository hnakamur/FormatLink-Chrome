'use strict';

const getOptions = async () => {
  const response = await chrome.runtime.sendMessage({ message: "getOptions" });
  return response.options;
}

const populateText = formattedText => {
  const textElem = document.getElementById('textToCopy');
  textElem.value = formattedText;
  textElem.focus();
  textElem.select();
};

const copyLink = async formatID => {
  const options = await getOptions();
  const format = options['format' + formatID];
  const asHTML = options['html' + formatID];

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tabs[0].id, {
    message: "copyLink",
    format,
    asHTML,
    platformOs: chrome.runtime.PlatformOs,
  });
  if (response) {
    populateText(response.result);
  }
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
      await copyLink(e.target.value);
    });

    const optTitle = options['title' + i];
    const text = document.createTextNode(optTitle);

    let label = document.createElement('label');
    label.appendChild(btn);
    label.appendChild(text);

    group.appendChild(label);
  }
}

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

document.addEventListener('DOMContentLoaded', async () => {
  const options = await getOptions();
  console.log('popup options=', options);
  if (options) {
    populateFormatGroup(options);
    await copyLink(options.defaultFormat);
  }

  document.getElementById('saveDefaultFormatButton').addEventListener('click', async () => {
    const formatID = getSelectedFormatID();
    if (formatID) {
      await chrome.runtime.sendMessage({
        message: 'updateDefaultFormat',
        formatID
      });
    }
  });
});
