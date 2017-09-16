function restoreOptions() {
  gettingOptions(options => {
    for (var i = 1; i <= 9; ++i) {
      document.getElementById('title'+i).value = options['title'+i] || '';
      document.getElementById('format'+i).value = options['format'+i] || '';
    }
  });
}

function saveOptions() {
  var options = {}
  for (var i = 1; i <= 9; ++i) {
    options['title'+i] = document.getElementById('title'+i).value;
    options['format'+i] = document.getElementById('format'+i).value;
  }
  chrome.storage.sync.set(options);
  createContextMenus(options);
}

function restoreDefaults() {
  for (var i = 1; i <= 9; ++i) {
    document.getElementById('title'+i).value = DEFAULT_OPTIONS['title'+i] || '';
    document.getElementById('format'+i).value = DEFAULT_OPTIONS['format'+i] || '';
  }
  saveOptions();
}

function init() {
  restoreOptions();
  document.getElementById('saveButton').addEventListener('click', saveOptions);
  document.getElementById('restoreDefaultsButton').addEventListener('click', restoreDefaults);
}

document.addEventListener('DOMContentLoaded', init);
