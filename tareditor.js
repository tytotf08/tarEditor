;!((lib = () => {}, ide = () => {}) => {
	window.tar = lib();
	window.tarIDE = ide();
})(() => {
	"use strict";
	const autocomplete = [
		{ open: "{", close: "}" },
		{ open: '"', close: '"' },
		{ open: "'", close: "'" },
		{ open: "`", close: "`" },
		{ open: "[", close: "]" },
		{ open: "(", close: ")" }
	];
	const tar = (wrap, ln = true, hl = (editor) => {editor.innerHTML = editor.innerHTML;}) => {
		if (!wrap) return;
		let downcb = (e) => {};
		let upcb = (e) => {};
		let focused = true;
		let at = 0;
		let last;
		let incarnations = [
			{html: "", pos: 0}
		];
		let info = {
			beforeCursor: "",
			afterCursor: ""
		};
		const saveCaretPosition = () => {
			const range = window.getSelection().getRangeAt(0);
			let prefix = range.cloneRange();
			prefix.selectNodeContents(editor);
			prefix.setEnd(range.endContainer, range.endOffset);
			return prefix.toString().length;
		}
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
		}
		const beforeCursor = () => {
			const s = window.getSelection();
			const r0 = s.getRangeAt(0);
			const r = document.createRange();
			r.selectNodeContents(editor);
			r.setEnd(r0.startContainer, r0.startOffset);
			return r.toString();
		};
		const afterCursor = () => {
			const s = window.getSelection();
			const r0 = s.getRangeAt(0);
			const r = document.createRange();
			r.selectNodeContents(editor);
			r.setStart(r0.endContainer, r0.endOffset);
			return r.toString();
		};
		const hasLeadingTabs = (context) => {
			const splice = beforeCursor(context);
			const endOfLine = splice.lastIndexOf("\n");
			const currentLine = splice.substr(endOfLine + 1);
			return currentLine.charAt(0) === "\t";
		};
		const getLeadingTabs = (context) => {
			const splice = beforeCursor(context);
			const endOfLine = splice.lastIndexOf("\n");
			const currentLine = splice.substr(endOfLine + 1);
			let tabs = "";
			let newtabs = "";
			let index = 0;
			while (currentLine.charAt(index++) === "\t") {
				tabs += "\t";
			}
			newtabs = tabs;
			return tabs;
		};
		if (wrap === document) {
			wrap = document.body;
		}
		if (wrap) {
			try {
				wrap.getAttribute("class");
			} catch(e) {
				throw new Error("No such HTMLElement: " + wrap.toString());
			}
		}
		wrap.classList.add("tar-wrap");
		wrap.style.display = "flex";
		wrap.style.flexDirection = "row";
		let editor = document.createElement("DIV");
		editor.style.whiteSpace = "pre";
		editor.style.flex = "97%";
		editor.classList.add("language-markdown");
		editor.classList.add("textarea");
		editor.setAttribute("spellcheck", false);
		if (String(window.navigator).toLowerCase().indexOf("firefox") > -1) {
			editor.setAttribute("contenteditable", true);
		} else {
			editor.setAttribute("contenteditable", "plaintext-only");
		}
		editor.addEventListener("focus", (e) => {
			focused = true;
			editor.style.outline = "none";
		});
		editor.addEventListener("blur", (e) => {
			focused = false;
		});
		let prev = editor.textContent;
		let line_numbers = document.createElement("DIV");
		line_numbers.innerHTML = "1";
		line_numbers.style.whiteSpace = "pre";
		line_numbers.style.flex = "3%";
		line_numbers.style.textAlign = "center";
		line_numbers.classList.add("line_numbers");
		let inputE = () => {
			prev = editor.textContent;
			let numberscontent = "1\n";
			const lines = editor.textContent.split(/\n(?!$)/g).length;
			line_numbers.innerHTML = "1\n";
			for (let i = 1; i < lines; i++) {
				line_numbers.innerHTML += String(i+1) + "\n";
			}
		};
		if (ln === true) {
			wrap.appendChild(line_numbers);
		} else {
			inputE = () => {
				prev = editor.textContent;
			};
			editor.style.paddingLeft = "1rem";
		}
		wrap.appendChild(editor);
		editor.addEventListener("input", (e) => {
			const pos = saveCaretPosition(editor);
			hl(editor);
			restoreCaretPosition(pos, editor);
			inputE();
		});
		editor.addEventListener("keydown", (e) => {
			if (e.key === "Tab") {
				e.preventDefault();
				if (e.shiftKey) {
					if (hasLeadingTabs(editor)) {
						const splice = beforeCursor(editor);
						const endOfLine = splice.lastIndexOf("\n");
						const currentLine = splice.substr(endOfLine + 1);
						const pos = saveCaretPosition(editor);
						restoreCaretPosition(pos-currentLine.length+1, editor);
						document.execCommand("delete");
						restoreCaretPosition(pos-1, editor);
					}
				} else {
					if (String(window.getSelection()).length > 0) {
						const beforeText = String(window.getSelection());
						if (beforeText.includes("\n")) {
							document.execCommand("delete");
							const splitBeforeText = beforeText.split("\n");
							for (let i = 0; i < splitBeforeText.length; i++) {
								splitBeforeText[i] = "\t" + splitBeforeText[i] + "\n";
								document.execCommand("insertHTML", false, splitBeforeText[i]+"\n");
							}
							document.execCommand("delete");
							const pos = saveCaretPosition(editor);
							restoreCaretPosition(pos - beforeText.length-splitBeforeText.length+1, editor);
						} else {
							document.execCommand("delete");
							document.execCommand("insertHTML", false, "\t" + beforeText);
							const pos = saveCaretPosition(editor);
							restoreCaretPosition(pos-beforeText.length, editor);
						}
					} else {
						document.execCommand("insertHTML", false, "\t");
					}
				}
			}
			if (e.key === "Enter") {
				const splice = beforeCursor(editor);
				const endOfLine = splice.lastIndexOf("\n");
				const currentLine = splice.substr(endOfLine + 1);
				if (getLeadingTabs(editor).length > 0) {
					e.preventDefault();
					if (!currentLine.trim().endsWith("{")) {
						document.execCommand("insertHTML", false, "\n"+getLeadingTabs(editor));
					} else {
						const tabs = getLeadingTabs(editor);
						document.execCommand("insertHTML", false, "\n"+tabs+"\t\n"+tabs);
						const pos = saveCaretPosition(editor);
						restoreCaretPosition(pos-tabs.length-1, editor);
					}
					
				} else {
					if (currentLine.trim().endsWith("{")) {
						e.preventDefault();
						afterCursor().trim().startsWith("}") ? document.execCommand("insertHTML", false, "\n\t\n\n") :  document.execCommand("insertHTML", false, "\n\t\n\n\n");
						const pos = saveCaretPosition(editor);
						restoreCaretPosition(pos-1, editor);
					}
				}
			}
			for (let i = 0; i < autocomplete.length; i++) {
				if (e.key === autocomplete[i].open) {
					e.preventDefault();
					if ((afterCursor().startsWith('"') || afterCursor().startsWith("'") || afterCursor().startsWith("`")) && (e.key === '"' || e.key === "'" || e.key === "`" )) {
						const pos = saveCaretPosition(editor);
						restoreCaretPosition(pos, editor);
					} else {
						if (String(window.getSelection()) !== "") {
							const beforeString = String(window.getSelection());
							document.execCommand("delete");
							document.execCommand("insertHTML", false, autocomplete[i].open+beforeString+autocomplete[i].close);
							const pos = saveCaretPosition(editor);
							restoreCaretPosition(pos-1, editor);
						} else {
							document.execCommand("insertHTML", false, autocomplete[i].open + autocomplete[i].close);
							const pos = saveCaretPosition(editor);
							if (e.key === '"' || e.key === "`" || e.key === "'") {
								restoreCaretPosition(pos-2, editor);
							} else {
								restoreCaretPosition(pos-1, editor);
							}
						}
					}
				}
				if (e.key === "Backspace" && beforeCursor().endsWith(autocomplete[i].open) && afterCursor().startsWith(autocomplete[i].close)) {
					e.preventDefault();
					const pos = saveCaretPosition(editor);
					restoreCaretPosition(pos+1, editor);
					for (let i = 0; i < 2; i++) {
						document.execCommand("delete");
					}
				}
				if (e.key === autocomplete[i].close) {
					if (afterCursor().startsWith(autocomplete[i].close)) {
						e.preventDefault();
						const pos = saveCaretPosition(editor);
						restoreCaretPosition(pos+1, editor);
					}
				}
			}
			if (e.key === "Backspace") {
				const splice = beforeCursor(editor);
				const endOfLine = splice.lastIndexOf("\n");
				const currentLine = splice.substr(endOfLine + 1);
				if (currentLine.length === 1 && afterCursor().split("\n")[0].length === 0) {
					e.preventDefault();
					const pos = saveCaretPosition(editor);
					document.execCommand("insertHTML", false, "&nbsp;");
					restoreCaretPosition(pos, editor);
					document.execCommand("delete");
				}
			}
			if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
				e.preventDefault();
				at--;
				if (at < 0) {
					at = 0;
					return;
				}
				editor.innerHTML = incarnations[at].html;
				restoreCaretPosition(incarnations[at].pos, editor);
				let numberscontent = "1\n";
				const lines = editor.textContent.split(/\n(?!$)/g).length;
				line_numbers.innerHTML = "1\n";
				for (let i = 1; i < lines; i++) {
					line_numbers.innerHTML += String(i+1) + "\n";
				}
			}
			if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
				e.preventDefault();
				at++;
				if (at > incarnations.length-1) {
					at = incarnations.length-1;
					return;
				}
				editor.innerHTML = incarnations[at].html;
				restoreCaretPosition(incarnations[at].pos, editor);
				let numberscontent = "1\n";
				const lines = editor.textContent.split(/\n(?!$)/g).length;
				line_numbers.innerHTML = "1\n";
				for (let i = 1; i < lines; i++) {
					line_numbers.innerHTML += String(i+1) + "\n";
				}
			}
			if (e.key === ">" && editor.getAttribute("class").includes("mark")) {
				let text = beforeCursor(editor).split(">");
				if (text[text.length - 1] !== "") {
					if (text[text.length - 1].trim().startsWith("<") && !text[text.length - 1].includes("/")) {
						e.preventDefault();
						if (text[text.length - 1] === "<!DOCTYPE html") {
							document.execCommand("insertHTML", false, "<");
						} else {
							text = text[text.length-1].split("<");
							text = text[text.length-1].split(" ");
							const insertText = String("&gt;&lt;/" + text[0] + "&gt;");
							document.execCommand("insertHTML", false, insertText);
							const pos = saveCaretPosition(editor);
							restoreCaretPosition(pos-(3+text[0].length), editor);
						}
					}
				}
			}
			downcb(e);
		});
		editor.addEventListener("keyup", (e) => {
			if (e.isComposing) return;
			if (String(window.getSelection()) !== "") return;
			info.beforeCursor = beforeCursor(editor);
			info.afterCursor = afterCursor(editor);
			window.setTimeout(() => {
				const html = editor.innerHTML;
				const pos = saveCaretPosition(editor);
				last = incarnations[at];
				if (last) {
					if (last.html === html && last.pos === last.pos) {
						return;
					}
				}
				at++;
				incarnations[at] = { html, pos };
			}, 150);
		});
		editor.addEventListener("mousedown", (e) => {
			try {
				info.beforeCursor = beforeCursor(editor);
				info.afterCursor = afterCursor(editor);
			} catch (IndexSizeError) {}		
		});
		return {
			textarea: editor,
			document: (pos, html) => {
				if (!pos && !html) {
					return {
						html: editor.innerHTML,
						pos: saveCaretPosition(editor)
					};
				} else if (!pos && html === true) {
					return editor.innerHTML;
				} else {
					return saveCaretPosition(editor);
				}		
			},
			setKeydownCB: (f) => {
				if (typeof f === "function") {
					downcb = f;
					return downcb;
				} else {
					return false;
				}
			},
			setKeyupCB: (f) => {
				if (typeof f === "function") {
					upcb = f;
					return upcb;
				} else {
					return false;
				}
			},
			info: () => {
				return info;
			}
		};
	};
	return tar;
},
() => {
	"use strict";
	let tarIDE = {};
	let mainTab;
	class tab {
		constructor(wrap)	{
			this.tabEl = document.createElement("DIV");
			this.tabEl.innerHTML = "untitled";
			this.tabEl.classList.add("taride-tab");
			this.tabEl.style.display = "flex";
			this.tabEl.style.flexDirection = "column";
			this.tabEl.style.justifyContent = "center";
			this.tabEl.style.alignItems = "center";
			this.wrap = wrap;
			this.wrap.appendChild(this.tabEl);
			mainTab = this;
			this.document = {
				html : "",
				pos: 0
			}
		}
		refresh(doc) {
			this.document = doc;
		}
	}
	tarIDE.init = (wrap, ln = true, hl = (editor) => {editor.innerHTML = editor.innerHTML;}) => {
		const tabBar = document.createElement("DIV");
		tabBar.classList.add("taride-bar");
		tabBar.style.display = "flex";
		tabBar.style.height = "5%";
		new tab(tabBar);
		const wrapper = document.createElement("DIV");
		wrap.appendChild(tabBar);
		wrap.appendChild(wrapper);
		wrap.addEventListener("keyup", (e) => {
			try {
				mainTab.refresh(editor.document());
				console.log(mainTab);
			} catch(err) {};
		});
		wrap.addEventListener("click", (e) => {
			try {
				mainTab.refresh(editor.document());
				console.log(mainTab);
			} catch(err) {};
		});
		wrap.classList.add("taride-wrapper")
		const editor = tar(wrapper, ln, hl);
		wrapper.style.height = "95%";
		return editor;
	}
	return tarIDE;
});