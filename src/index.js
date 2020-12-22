import * as u from "./utils.js";
console.log(u);
const _self = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this;
class Tar {
	constructor(wrap) {
		if (!(wrap instanceof Node)) return false;
		this.ln = false;
		this.wrap = wrap;
		this.scroller = document.createElement("DIV");
		this.textarea = document.createElement("DIV");
		u.initTextarea(this.textarea);
		this.prev = this.textarea.textContent;
		this.timeMachine = [
			{
				html: "",
				pos: 0
			}
		];
		this.at = 0;
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
					if (this.prev !== this.editor.textContent()) {
						cb();
					}
				}
			},
			refresh: () => {
				this.prev = this.editor.textContent();
			},
			before: () => {
				return u.beforeCursor(this.textarea);
			},
			after: () => {
				return u.afterCursor(this.textarea);
			},
			save: () => {
				return this.editor.before().length;
			},
			restore: (pos) => {
				return u.restoreCaretPosition(pos, this.textarea);
			},
			insert: (text = "") => {
				const newContent = this.editor.before() + text + this.editor.after();
				const pos = this.editor.save();
				this.textarea.textContent = newContent;
				this.editor.restore(pos + text.length);
			},
			setHTML: (text = "") => {
				this.textarea.innerHTML = text;
			}
		};
		this.editor.on("keydown", e => {
			this.editor.refresh();
			const isTab = this.indent(e);
			const isEnter = this.enter(e);
			const isAutoComplete = this.autoComplete(e);
			const undoRedo = this.setVer(e);
			const isBackSpace = this.delete(e);
		});
		this.editor.on("keyup", e => {
			this.editor.diff(() => {
				if (this.lineNumbers) {
					this.lineNumbers.innerHTML = "1<br>";
					const lines = this.editor.textContent().split(/\n(?!$)/g).length;
					for (let i = 1; i < lines; i++) {
						this.lineNumbers.innerHTML += String(i + 1) + "<br>";
					}
				}
				const pos = this.editor.save();
				const text = this.editor.textContent().replace(/</g, "&lt;");
				this.editor.setHTML(text);
				this.editor.restore(pos);
				const splitText = this.editor.innerHTML().split("\n");
				window.setTimeout(() => {
					if (this.timeMachine[this.at].html === this.editor.innerHTML()) {
						return;
					}
					this.at++;
					const html = this.editor.innerHTML();
					const pos = this.editor.save();
					this.timeMachine.push({html, pos});
				}, 300);
			});
		});
		u.initScroller(this.scroller);
		u.initWrap(this.wrap);
		this.scroller.appendChild(this.textarea);
		this.wrap.appendChild(this.scroller);
		return this;
	}
	setLN(b) {
		this.ln = true;
		this.lineNumbers = document.createElement("DIV");
		this.lineNumbers.style.width = "3%";
		this.textarea.style.flex = "97%";
		this.scroller.insertBefore(this.lineNumbers, this.textarea);
		this.lineNumbers.innerHTML = "1<br>";
		this.lineNumbers.style.paddingTop = "6px";
		this.lineNumbers.style.textAlign = "center";
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
	enter(e) {
		if (e.key === "Enter") {
			const currentLine = u.lastOf(this.editor.before().split("\n"));
			let tabs = "";
			let i = 0;
			while (currentLine.charAt(i) === "\t") {
				tabs += "\t";
				i++;
			};
			if (currentLine.endsWith("{") && this.editor.after().startsWith("}")) {
				e.preventDefault();
				this.editor.insert("\n" + tabs + "\t");
				const pos = this.editor.save();
				this.editor.insert("\n" + tabs);
				this.editor.restore(pos);
			} else {
				if (tabs.length > 0) {
					e.preventDefault();
					this.editor.insert("\n" + tabs);
				}
			}
			if (this.lineNumbers) {
				const next = String(Number(this.lineNumbers.innerHTML.split("<br>")[this.lineNumbers.innerHTML.split("<br>").length-2]) + 1) + "<br>";
				this.lineNumbers.innerHTML += next;
			}
			return true;
		} else {
			return false;
		}
	}
	autoComplete(e) {
		for (let i = 0; i < u.specialChars.start.length; i++) {
			if (e.key === u.specialChars.start[i]) {
				e.preventDefault();
				if (u.specialChars.start[i] === u.specialChars.end[i] && ((this.editor.before().endsWith(u.specialChars.start[i]) && this.editor.after().startsWith(u.specialChars.end[i])))) {
					const pos = this.editor.save() + 1;
					this.editor.restore(pos);
				} else {
					this.editor.insert(u.specialChars.start[i] + u.specialChars.end[i]);
					const pos = this.editor.save() - 1;
					this.editor.restore(pos);
				}
				break;	
			} else if (e.key === u.specialChars.end[i]) {
				if (this.editor.before().endsWith(u.specialChars.start[i]) && this.editor.after().startsWith(u.specialChars.end[i])) {
					e.preventDefault();
					const pos = this.editor.save() + 1;
					this.editor.restore(pos);
				} 
				break;
			}
		}
	}
	setVer(e) {
		if (!e.shiftKey && (e.ctrlKey || e.metaKey) && e.key === "z") {
			e.preventDefault();
			this.at--;
			if (this.at < 0) {
				this.at = 0;
			} else {
				this.editor.setHTML(this.timeMachine[this.at].html);
				this.editor.restore(this.timeMachine[this.at].pos);
			}
			return true;
		} else {
			if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key === "z") {
				e.preventDefault();
				this.at++;
				if (this.at >= this.timeMachine.length) {
					this.at = this.timeMachine.length-1;
				} else {
					this.editor.setHTML(this.timeMachine[this.at].html);
					this.editor.restore(this.timeMachine[this.at].pos);
				}
				return true;
			} else {
				return false;
			}
		}
	}
	delete(e) {
		if (e.key === "Backspace") {
			const currentLine = u.lastOf(this.editor.innerHTML().split("\n"));
			if (this.lineNumbers) {
				this.lineNumbers.innerHTML = "1<br>";
				const lines = this.editor.textContent().split(/\n(?!$)/g).length;
				for (let i = 2; i < lines; i++) {
					this.lineNumbers.innerHTML += String(i) + "<br>";
				}
			}
			
			return true;
		} else {
			return false;
		}
	}
};
const tar = (wrap) => {
	return new Tar(wrap);
};
_self.tar = tar;