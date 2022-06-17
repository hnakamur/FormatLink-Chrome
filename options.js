'use strict';

const getOptions = async () => {
  const response = await chrome.runtime.sendMessage({ message: "getOptions" });
  return response.options;
}

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
