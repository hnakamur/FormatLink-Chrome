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
    btn.addEventListener('click', async e => {
      var formatID = e.target.value;
      var options = await gettingOptions();
      var format = options['format' + formatID];
      var formattedText = formatURL(format, lastCopied.url, lastCopied.title, lastCopied.text);
      updateAndSelectText(formattedText);
      document.execCommand('copy');
      if (formatID !== options.defaultFormat) {
        await saveDefaultFormat(formatID);
        options.defaultFormat = formatID;
      }
      await createContextMenus(options);
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

async function init() {
  var res = await chrome.storage.local.get('lastCopied');
  var lastCopied = res.lastCopied;
  if (lastCopied && lastCopied.formattedText) {
    updateAndSelectText(lastCopied.formattedText);
  }
  var options = await gettingOptions();
  await createRadioButtons(options, lastCopied);
}
document.addEventListener('DOMContentLoaded', init);
