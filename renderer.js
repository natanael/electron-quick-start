// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// const _ = require('lodash');

const enumSnippet = lines => `
class MyThing {
  string toString() {${
    lines.map(line => `
    if (inner.enum == InnerEnum::${_.camelCase(line)}) {
      return "${_.snakeCase(line).toUpperCase()}";
    }`).join('')}
  }
}
`;

const coutSnippet = lines => 
    lines.map(line => `std::cout << "${line}:" << ${line} << std::endl;`).join('\n')

const splitCommasSnippet = lines => lines.map(line => line.split(/\s*,\s*/).join('\n')).join('\n');

const joinCommasSnippet = lines => lines.join(', ');

const transform = {
  result: '',
  get() {
    return result.split('\n');
  },
  set(text) {
    result = text;
    document.getElementById('out-txt').innerText = text;
    window.clipboard.send(text);
  },
  transform(fn) {
    this.set(fn(this.get()));
  },
  refresh () {
    const text = window.clipboard.get();
    this.set(text)
    document.getElementById('in-txt').innerText = text;
  }
}

transform.refresh();

document.getElementById('refresh-btn').addEventListener('click', () => {
  transform.refresh();
})

document.getElementById('copy-btn').addEventListener('click', () => {
  window.clipboard.send(transformed);
})

const handler = (elemId, snippet) => {
  const instance = ({
    elem: document.getElementById(elemId),
    snippet,
    init() {
      this.elem.addEventListener('click', this.clickFn.bind(this));
    },
    clickFn () {
      transform.transform(this.snippet);
    }
  });
  instance.init();
  return instance;
}

const enumHandle        = handler('snip-btn-1', enumSnippet);
const coutHandle        = handler('snip-btn-2', coutSnippet);
const splitCommasHandle = handler('snip-btn-3', splitCommasSnippet);
const joinCommasHandle  = handler('snip-btn-4', joinCommasSnippet);

document.addEventListener('keypress', (e) => {
  console.log(e);
  if (e.code === "Numpad0") { transform.refresh(); }
  if (e.code === "Numpad1") { enumHandle.clickFn(); }
  if (e.code === "Numpad2") { coutHandle.clickFn(); }
  if (e.code === "Numpad3") { splitCommasHandle.clickFn(); }
  if (e.code === "Numpad4") { joinCommasHandle.clickFn(); }
})
