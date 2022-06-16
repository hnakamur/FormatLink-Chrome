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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // console.log('onMessage request=', request);
    if (request.message === 'getOptions') {
        chrome.storage.sync.get(DEFAULT_OPTIONS).then(options => {
            // console.log('background get options, options=', options);
            sendResponse({options});
        })
    }
    return true;
});


function gettingOptions() {
  return chrome.storage.sync.get(DEFAULT_OPTIONS)
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

// console.log('my extension background.js');
// function myAction() {
//     console.log('my extension onClicked');
// }

// chrome.action.onClicked.addListener((tab) => {
//     chrome.tabs.sendMessage(tab.id, 
//         {
//             message: "copyText",
//             textToCopy: "some text" 
//         }, function(response) {})
// // if(!tab.url.includes("chrome://")) {
//         // chrome.scripting.executeScript({
//         //   target: { tabId: tab.id },
//         //   function: myAction
//         // });
//     // }
// });

// chrome.runtime.onInstalled.addListener(async () => {
//     console.log('my extension background.js onInstalled');

// // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// //     chrome.tabs.sendMessage(tabs[0].id, 
// //         {
// //             message: "copyText",
// //             textToCopy: "some text" 
// //         }, function(response) {})
// // })

// let url = chrome.runtime.getURL("hello.html");

// // Open a new tab pointing at our page's URL using JavaScript's object initializer shorthand.
// // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#new_notations_in_ecmascript_2015
// //
// // Many of the extension platform's APIs are asynchronous and can either take a callback argument
// // or return a promise. Since we're inside an async function, we can await the resolution of the
// // promise returned by the tabs.create call. See the following link for more info on async/await.
// // https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await
// let tab = await chrome.tabs.create({ url });

// // Finally, let's log the ID of the newly created tab using a template literal.
// // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
// //
// // To view this log message, open chrome://extensions, find "Hello, World!", and click the
// // "service worker" link in the card to open DevTools.
// console.log(`Created tab ${tab.id}`);


// });

