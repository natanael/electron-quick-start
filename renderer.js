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

const coutToLoggerSnippet = (lines) => {
	const text = lines.join('').trim().replace(/\[COUT_LOG_\d{4}\] /, '').slice(0, -1);
	const chunks = text.split('<<').map(chunk => chunk.trim()).slice(1);
	if (chunks[chunks.length - 1].match('endl')) {
		chunks.pop();
	}
	let message = "";
	const args = [];
	for (const chunk of chunks) {
		if (chunk.match(/^".*"$/)) {
			message += chunk.slice(1, -1);
		} else {
			message += "{}";
			args.push(chunk);
		}
	}
	return args.length > 0
		?	`LOG_TRACE(logger, "${message}", ${args.join(', ')});`
		: `LOG_TRACE(logger, "${message}");`
	
	// const text = lines.join('').trim();
	// const matches = text.match(/"[^"]*"|[a-zA-Z0-9\(\)_\.\<\>\-\*\[\]&]+/g);
	// let line = `LOG_TRACE(logger, "`;
	// let params = [];
	
	// for (let match of matches) {
	// 	match = match.trim();

	// 	if (match.startsWith(`"`)) {
	// 		if (match.startsWith(`"[COUT_LOG`) || match === `"\n"`) continue;
	// 		line += match.slice(1,-1);
	// 	} else if (match === '<<' || match === 'cout' || match === 'cerr' || match === 'endl') {
	// 		continue;
	// 	} else {
	// 		line += `{}`;
	// 		params.push(match);
	// 	}
	// }

	// line += `"`;
	// for (const param of params) {
	// 	line += `, ${param}`;
	// }
	// line += `);`
	// return line;
};

const logMessageToLoggerSnippet = lines => {
	/*
	string for_log("Added request id: ");
	for_log += id;
	for_log += " onto the map of request ids";
	LogMessage(CLogFile::MINOR, for_log);
	*/
	let message = "";
	// if (lines[0].trim().startsWith("string ")) {
	const logMessage = lines.pop();
	const args = [];
	for (let line of lines) {
		line = line.trim();
		let match = line.match(/".*"/);
		if (match != null) {
			message += match[0].slice(1, -1);
			continue;
		}
		match = line.match(/\+\=\s*(.*)\;/);
		if (match != null) {
			args.push(match[1]);
			message += '{}';
			continue;
		}
	}
	return `LOG_TRACE(logger, "${message}", ${args.join(', ')});`
	// }
	// return "DIDNT MATCH"
};

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

const enumHandle               = handler('snip-btn-1', paramsValuesSnippet);
const coutHandle               = handler('snip-btn-2', paramsTypesSnippet);
const splitCommasHandle        = handler('snip-btn-3', splitCommasSnippet);
const joinCommasHandle         = handler('snip-btn-4', joinCommasSnippet);
const coutToLoggerHandle       = handler('snip-btn-5', coutToLoggerSnippet);
const logMessageToLoggerHandle = handler('snip-btn-6', logMessageToLoggerSnippet);

document.addEventListener('keypress', (e) => {
	// https://keycode.info/
	console.log(e);
	if (e.code === "Numpad9") { transform.lastOne(); }
	if (e.code === "Numpad0") { transform.refresh(); }
	if (e.code === "Numpad1") { enumHandle.clickFn(); }
	if (e.code === "Numpad2") { coutHandle.clickFn(); }
	if (e.code === "Numpad3") { splitCommasHandle.clickFn(); }
	if (e.code === "Numpad4") { joinCommasHandle.clickFn(); }
	if (e.code === "Numpad5") { coutToLoggerHandle.clickFn(); }
	if (e.code === "Numpad6") { logMessageToLoggerHandle.clickFn(); }
});
