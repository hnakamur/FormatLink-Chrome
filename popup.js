function saveDefaultFormat(format) {
  chrome.storage.sync.set({defaultFormat: format});
}

function getFormatCount(options) {
  var i;
  for (i = 1; i <= 9; ++i) {
    var optTitle = options['title' + i];
    var optFormat = options['format' + i];
    if (optTitle === '' || optFormat === '') {
      break;
    }
  }
  return i - 1;
}

function updateAndSelectText(formattedText) {
  var textElem = document.getElementById('textToCopy');
  textElem.value = formattedText;
  textElem.focus();
  textElem.select();
}

function createRadioButtons(options, lastCopied) {
  var defaultFormat = options['defaultFormat'];
  var radios = [];
  var cnt = getFormatCount(options);
  var group = document.getElementById('formatGroup');
  for (var i = 1; i <= cnt; ++i) {
    var radioId = 'format' + i;

    var btn = document.createElement('input');
    btn.setAttribute('type', 'radio');
    btn.setAttribute('name', 'fomrat');
    btn.setAttribute('id', radioId);
    btn.setAttribute('value', i);
    if (i == defaultFormat) {
      btn.setAttribute('checked', 'checked');
    }
    btn.addEventListener('click', e => {
      var formatId = e.target.value;
      var format = options['format' + formatId];
      var formattedText = formatURL(format, lastCopied.url, lastCopied.title, lastCopied.text);
      updateAndSelectText(formattedText);
      document.execCommand('copy');
      saveDefaultFormat(formatId);
    });

    var label = document.createElement('label');
    label.setAttribute('for', radioId);
    var optTitle = options['title' + i];
    var text = document.createTextNode(optTitle);
    label.appendChild(text);

    var span = document.createElement('span')
    span.setAttribute('class', 'radio');
    span.appendChild(btn);
    span.appendChild(label);

    group.appendChild(span);
  }
}

function init() {
  chrome.storage.local.get('lastCopied', res => {
    var lastCopied = res.lastCopied;
    if (lastCopied && lastCopied.formattedText) {
      updateAndSelectText(lastCopied.formattedText);
    }
    gettingOptions(options => {
      createRadioButtons(options, lastCopied);
    });
  });
}
document.addEventListener('DOMContentLoaded', init);
