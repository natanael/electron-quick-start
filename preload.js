// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }

})

window._ = require('lodash');

const { remote } = require('electron');

let currWindow = remote.BrowserWindow.getFocusedWindow();

window.closeCurrentWindow = function(){
  currWindow.close();
}

const { clipboard } = require('electron')

// clipboard.writeText('Example String', 'selection')
console.log(clipboard.readText('selection'))
window.clipboard = {
  get() {
    return clipboard.readText('selection');
  },
  send(text/* : string */) {
    return clipboard.writeText(text);
  }
}

