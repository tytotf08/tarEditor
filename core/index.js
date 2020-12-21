// "use strict";
// const initScroller = scroller => { // this.scroller styles
// 	scroller.style.overflowY = "auto";
// 	scroller.classList.add("tar-scroller");
// 	scroller.style.display = "flex";
// 	scroller.style.flexDirection = "center";
// };
// const initLineNumbers = lineNumbers => {
// 	lineNumbers.style.width = "3%";
// 	lineNumbers.innerHTML = "1<br>";
// 	lineNumbers.style.paddingTop = "8px";
// 	lineNumbers.style.display = "flex";
// 	lineNumbers.style.flexDirection = "column";
// 	lineNumbers.style.alignItems = "center";
// };
// const initWrap = wrap => { // wrap styles
// 	wrap.classList.add("tar-wrap"); 
// 	wrap.style.display = "flex";
// 	wrap.style.flexDirection = "column";
// 	wrap.style.overflow = "hidden";
// };
// const initTextarea = (textarea, ln = false) => { // set textarea styles
// 	textarea.setAttribute("contenteditable", window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1 ? true: "plaintext-only");
// 	textarea.style.outline = "0px solid transparent";
// 	textarea.style.whiteSpace = "pre";
// 	textarea.style.wordWrap = "normal";
// 	textarea.setAttribute("spellcheck", false);
// 	textarea.classList.add("tar-textarea");
// 	textarea.style.padding = "8px";
// };
// const beforeCursor = (el) => { // get all text before caret
// 	const s = window.getSelection();
// 	const r0 = s.getRangeAt(0);
// 	const r = document.createRange();
// 	r.selectNodeContents(el);
// 	r.setEnd(r0.startContainer, r0.startOffset);
// 	return r.toString();
// };
// const afterCursor = (el) => { // get all text after caret
// 	const s = window.getSelection();
// 	const r0 = s.getRangeAt(0);
// 	const r = document.createRange();
// 	r.selectNodeContents(el);
// 	r.setStart(r0.endContainer, r0.endOffset);
// 	return r.toString();
// };
// const restoreCaretPosition = (pos, el) => { // set caret
// 	for (const node of el.childNodes) {
// 		if (node.nodeType == Node.TEXT_NODE) {
// 			if (node.length >= pos) {
// 				let range = document.createRange();
// 				let sel = window.getSelection();
// 				range.setStart(node, pos);
// 				range.collapse(true);
// 				sel.removeAllRanges();
// 				sel.addRange(range);
// 				return -1;
// 			} else {
// 				pos = pos - node.length;
// 			}
// 		} else {
// 			pos = restoreCaretPosition(pos, node);
// 			if (pos < 0) {
// 				return pos;
// 			}
// 		}
// 	}
// 	return pos;
// };
// class Tar { // main class 
// 	constructor(wrap) { // get wrap this.element
// 		if (!(wrap instanceof Node)) { // is wrap an this.element 
// 			this.success = false;
// 		} else {
// 			this.success = true;
// 		};
// 		let ln_content = "1<br>"; // what to put in line numbers this.el (if existing) 
// 		this.ln = false; // ln boolean accessible in object scope 
// 		this.scroller = document.createElement("DIV"); // this.scroller 
// 		this.el = document.createElement("DIV"); // textarea 
// 		let prev = this.el.textContent; // before
// 		const save = () => {
// 			return beforeCursor(this.el).length; // return the length of the text before caret 
// 		};
// 		const editor = { // special object
// 			html: () => {
// 				return this.el.innerHTML; // get displayed html 
// 			},
// 			plain: () => {
// 				return this.el.textContent; // get plain textcontent 
// 			},
// 			on: (e, fn) => {
// 				for (let i = 0; i < e.length; i++) { // takes an array so one callback can be for multiple events 
// 					this.el.addEventListener(e[i], fn);
// 				};			
// 			},
// 			insert: (text) => {
// 				let before = beforeCursor(this.el); // get before
// 				const pos = save(); // get pos
// 				const after = afterCursor(this.el); // get after
// 				before += text; // add text to before
// 				this.el.textContent = before + after; // set html as the new text
// 				editor.setCaret(pos+text.length); // restore caret after text
// 			},
// 			setHTML: (text) => {
// 				this.el.innerHTML = text;
// 			},
// 			setCaret: (pos) => {
// 				restoreCaretPosition(pos, this.el);
// 			},
// 			diff: (cb) => {
// 				if (prev !== this.el.textContent) {
// 					cb();
// 				}
// 			}
// 		};
// 		const indent = e => {
// 			if (e.key === "Tab") {
// 				e.preventDefault();
// 				if (e.shiftKey) {
// 				} else {
// 					const sel = String(window.getSelection()); // get selection
// 					editor.insert("\t" + sel); // insert tab and selection
// 					const before = beforeCursor(this.el); // get before caret
// 					editor.setCaret(before.length-sel.length); // restore after tab
// 				}
// 				return true; // key is tab
// 			} else {
// 				return false; // other key
// 			}
// 		};
// 		const lastOf = (a) => {
// 			return a[a.length-1]; // length starts at 1 so subtract 1 to get last this.element in array
// 		};
// 		const enter = e => {
// 			if (e.key === "Enter") {
// 				const currentLine = lastOf(beforeCursor(this.el).split("\n")).split("");
// 				let tabs = "";
// 				for (let i = 0; i < currentLine.length; i++) {
// 					if (currentLine[i] === "\t") {
// 						tabs += "\t";
// 					}
// 				};
// 				if (tabs.length > 0 || (window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1)) {
// 					e.preventDefault();
// 					editor.insert("\n" + tabs);
// 				}
// 				return true; // key is enter
// 			} else {
// 				return false; // other key
// 			}
// 		};
// 		editor.on(["keydown"], e => {
// 			prev = editor.plain();
// 			const isEnter = enter(e);
// 			if (isEnter && this.ln === true) {
// 				if (this.lineNumbers) {
// 					const splitLineNumbers = this.lineNumbers.innerHTML.split("<br>");
// 					splitLineNumbers.pop();
// 					const numLast = Number(lastOf(splitLineNumbers));
// 					const nextNum = String(numLast + 1) + "<br>";
// 					this.lineNumbers.innerHTML += nextNum;
// 				} else {
// 					this.lineNumbers = document.createElement("DIV");
// 					initTextarea(this.el, true);
// 					initLineNumbers(this.lineNumbers);
// 					this.scroller.insertBefore(this.lineNumbers, this.el);
// 				}
// 			}
// 			const isTab = indent(e);
// 		});
// 		editor.on(["paste"], e => {
// 			e.preventDefault();
// 			const text = e.clipboardData.getData("text/plain");
// 			editor.insert(text);
// 		});
// 		editor.on(["keyup"], e => {
// 			editor.diff(() => {
// 				const pos = save();
// 				let text = editor.plain();
// 				text = text
// 					.replace(/</g, "&lt;")
// 					.replace(/>/g, "&gt;");
// 				editor.setHTML(text);
// 				editor.setCaret(pos);
// 			});
// 		});
// 		initScroller(this.scroller);
// 		initWrap(wrap);
// 		initTextarea(this.el, this.ln);
// 		if (this.ln === true) {
// 			this.lineNumbers = document.createElement("DIV");
// 			initLineNumbers(this.lineNumbers);
// 			this.scroller.insertBefore(this.lineNumbers, this.el);
// 		}
// 		this.scroller.appendChild(this.el);
// 		wrap.appendChild(this.scroller);
// 		return this;
// 	}
// 	setLN(b) {
// 		if (typeof b === "boolean") {
// 			this.ln = b;
// 			this.lineNumbers = document.createElement("DIV");
// 			initLineNumbers(this.lineNumbers);
// 			this.scroller.insertBefore(this.lineNumbers, this.el);
// 		}
// 		return this;
// 	}
// };
const restoreCaretPosition = (pos, context) => {
	for (const node of context.childNodes) {
		if (node.nodeType == Node.TEXT_NODE) {
			if (node.length >= pos) {
				let range = document.createRange();
				let sel = window.getSelection();
				range.setStart(node, pos);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
				return -1;
			} else {
				pos = pos - node.length;
			}
		} else {
			pos = restoreCaretPosition(pos, node);
			if (pos < 0) {
				return pos;
			}
		}
	}
	return pos;
};
const beforeCursor = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
};
const afterCursor = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setStart(r0.endContainer, r0.endOffset);
	return r.toString();
};
const initWrap = wrap => {
	wrap.classList.add("tar-wrap");
	wrap.style.display = "flex";
	wrap.style.flexDirection = "column";
	wrap.style.overflow = "hidden";
};
const initScroller = scroller => {
	scroller.style.flex = 1;
	scroller.classList.add("tar-scroller");
	scroller.style.overflow = "auto";
};
const initTextarea = textarea => {
	textarea.setAttribute("contenteditable", navigator.userAgent.toLowerCase().indexOf("firefox") > -1 ? true : "plaintext-only");
	textarea.setAttribute("spellcheck", false);
	textarea.classList.add("tar-textarea");
	textarea.style.whiteSpace = "pre";
	textarea.style.wordWrap = "normal";
	textarea.style.overflowY = "hidden";
	textarea.style.padding = "6px";
	textarea.style.outline = "0px solid transparent";
};
class Tar {
	constructor(wrap) {
		if (!(wrap instanceof Node)) return false;
		this.wrap = wrap;
		this.scroller = document.createElement("DIV");
		this.textarea = document.createElement("DIV");
		initTextarea(this.textarea);
		this.prev = this.textarea.textContent;
		initScroller(this.scroller);
		initWrap(this.wrap);
		this.scroller.appendChild(this.textarea);
		this.wrap.appendChild(this.scroller);
		this.editor = {
			on: (e, f) => {
				this.textarea.addEventListener(e, f);
			},
			innerHTML: () => {
				return this.textarea.innerHTML;
			},
			textContent: () => {
				return this.textarea.textContent;
			},
			diff: cb => {
				if (typeof cb === "function") {
					if (prev !== this.editor.textContent()) {
						cb();
					}
				}
			},
			refresh: () => {
				prev = this.editor.textContent();
			},
			before: () => {
				return beforeCursor(this.textarea);
			},
			after: () => {
				return afterCursor(this.textarea);
			},
			save: () => {
				return this.editor.before().length;
			},
			restore: (pos) => {
				return restoreCaretPosition(pos, this.textarea);
			},
			insert: (text = "") => {
				const newContent = this.editor.before() + text + this.editor.after();
				const pos = this.editor.save();
				this.textarea.textContent = newContent;
				this.editor.restore(pos + text.length);
			}
		};
		this.editor.on("keydown", e => {
			const isTab = this.indent(e);
		});
		return this;
	}
	setLN(b) {
		return this;
	}
	indent(e) {
		if (e.key === "Tab") {
			e.preventDefault();
			if (e.shiftKey) {
			} else {
				const sel = String(window.getSelection());
				this.editor.insert("\t" + sel);
				const pos = this.editor.save();
				this.editor.restore(pos-sel.length);
			}
			return true;
		} else {
			return false;
		}
	}
}