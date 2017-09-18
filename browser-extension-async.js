var browser = {
  menus: {
    create: function(props) {
      return new Promise((resolve, reject) => {
        chrome.contextMenus.create(props, () => {
          var err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
};
