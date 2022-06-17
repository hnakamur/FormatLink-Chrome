'use strict';

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

const getOptions = async () => {
  const options = await chrome.storage.sync.get(DEFAULT_OPTIONS);
  const count = getFormatCount(options);
  return { ...options, count, maxCount: FORMAT_MAX_COUNT };
};

const restoreOptions = async () => {
  const options = await getOptions();
  for (let i = 1; i <= options.maxCount; ++i) {
    document.getElementById('title'+i).value = options['title'+i] || '';
    document.getElementById('format'+i).value = options['format'+i] || '';
    document.getElementById('html'+i).checked = !!options['html'+i];
  }
  document.getElementById('createSubmenusCheckbox').checked = options['createSubmenus'];
};

const saveOptions = async defaultFormatID => {
  let options;
  try {
    options = defaultFormatID ?
      {'defaultFormat': defaultFormatID} : await getOptions();
    for (let i = 1; i <= options.maxCount; ++i) {
      options['title'+i] = document.getElementById('title'+i).value;
      options['format'+i] = document.getElementById('format'+i).value;
      options['html'+i] = document.getElementById('html'+i).checked ? 1 : 0;
    }
    options['createSubmenus'] = document.getElementById('createSubmenusCheckbox').checked;
  } catch (err) {
    console.error("failed to get options", err);
  }
  try {
    await chrome.storage.sync.set(options);
  } catch (err) {
    console.error("failed to save options", err);
  }
  try {
    await chrome.runtime.sendMessage({
      message: 'createContextMenus',
      options,
    });    
  } catch (err) {
    console.error("failed to update context menu", err);
  }
}

const restoreDefaults = async () => {
  for (let i = 1; i <= FORMAT_MAX_COUNT; ++i) {
    document.getElementById('title'+i).value = DEFAULT_OPTIONS['title'+i] || '';
    document.getElementById('format'+i).value = DEFAULT_OPTIONS['format'+i] || '';
    document.getElementById('html'+i).checked = !!DEFAULT_OPTIONS['html'+i];
  }
  document.getElementById('createSubmenusCheckbox').checked = DEFAULT_OPTIONS['createSubmenus'];
  await saveOptions(DEFAULT_OPTIONS['defaultFormat']);
}

document.addEventListener('DOMContentLoaded', async () => {
  await restoreOptions();
  document.getElementById('saveButton').addEventListener('click', async e => {
    await saveOptions();
  });
  document.getElementById('restoreDefaultsButton').addEventListener('click', async e => {
    await restoreDefaults();
  });
});
