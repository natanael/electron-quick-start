// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// const _ = require('lodash');

// const paramsValuesSnippet = lines => `
// class MyThing {
//   string toString() {${
//     lines.map(line => `
//     if (inner.enum == InnerEnum::${_.camelCase(line)}) {
//       return "${_.snakeCase(line).toUpperCase()}";
//     }`).join('')}
//   }
// }
// `;

/* 
{ name: 'childDispatchId', type: TYPES.VarChar, value: tenantizedChildDispatchId },
{ name: 'messageId', type: TYPES.VarChar, value: tenantizedMessageId },
{ name: 'utcNow', type: TYPES.VarChar, value: Utils.date.nowISO() }
*/
const paramsValuesSnippet = lines => {
  console.log(lines);
  return `{\n${lines.filter(Boolean).map(line => line
    .replace(/^\s+/,'  ')
    .replace(/\{\s*name:\s*['|"]/, '')
    .replace(/['|"].*value\:/, ':')
    .replace(/\s*}/, '')).join('\n')}\n}`
}

const types = {
  VarChar: 'string',
  NVarChar: 'string',
  Text: 'string',
  Int: 'number',
  BigInt: 'number',
  TinyInt: 'number',
  SmallInt: 'number',
  Bit: 'boolean',
  Float: 'number',
  Numeric: 'number',
  Decimal: 'number',
  Real: 'number',
  Date: 'Date',
  DateTime: 'Date',
  DateTime2: 'Date',
  DateTimeOffset: 'Date',
  SmallDateTime: 'Date',
  Time: 'number',
  UniqueIdentifier: 'number',
  SmallMoney: 'number',
  Money: 'number',
  Binary: 'Buffer',
  VarBinary: 'Buffer',
  Image: 'Buffer',
  Xml: 'string',
  Char: 'string',
  NChar: 'string',
  NText: 'string',
  TVP: 'any',
  UDT: 'any',
  Geography: 'any',
  Geometry: 'any',
  Variant: 'any',
}

function convertType(type) {
  return types[type] || 'any';
}

// const paramsTypesSnippet = lines => lines.map(line => `std::cout << "${line}:" << ${line} << std::endl;`).join('\n');
const paramsTypesSnippet = lines => {
  console.log(lines);
  return `{\n${lines.filter(Boolean).map(line => line
    .replace(/^\s+/,'  ')
    .replace(/\{\s*name:\s*['|"]/, '')
    .replace(/['|"]\s*,\s*type:\s*TYPES\.([a-zA-Z]+).*/, (all, typename) => `: ${convertType(typename)}`)
    .replace(/\s*}/, '')).join(';\n')};\n}`
}

const splitCommasSnippet = lines => lines.map(line => line.split(/\s*,\s*/).join('\n')).join('\n');

const joinCommasSnippet = lines => lines.join(', ');

const transform = {
  result: '',
  stack : [],
  get() {
    return this.result.split('\n');
  },
  set(text) {
    if (this.stack[this.stack-1] != text) {
      this.stack.push(this.result);
    }
    this.result = text;
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
  },
  lastOne() {
    console.log(this.stack);
    this.set(this.stack.pop() || '');
  }
}

transform.refresh();

document.getElementById('refresh-btn').addEventListener('click', () => {
  transform.refresh();9
});

document.getElementById('last-clip-btn').addEventListener('click', () => {
  window.clipboard.send(transform.stack[0]);
});

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

const enumHandle        = handler('snip-btn-1', paramsValuesSnippet);
const coutHandle        = handler('snip-btn-2', paramsTypesSnippet);
const splitCommasHandle = handler('snip-btn-3', splitCommasSnippet);
const joinCommasHandle  = handler('snip-btn-4', joinCommasSnippet);

document.addEventListener('keypress', (e) => {
  // https://keycode.info/
  console.log(e);
  if (e.code === "Numpad9") { transform.lastOne(); }
  if (e.code === "Numpad0") { transform.refresh(); }
  if (e.code === "Numpad1") { enumHandle.clickFn(); }
  if (e.code === "Numpad2") { coutHandle.clickFn(); }
  if (e.code === "Numpad3") { splitCommasHandle.clickFn(); }
  if (e.code === "Numpad4") { joinCommasHandle.clickFn(); }
});
