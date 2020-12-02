;!(function(f) {
	if (typeof module !== "undefined" && typeof exports === "object") {
		module.exports = f();
	} else if (typeof window !== "undefined") {
		window.Tar = f();
	} else if (typeof global !== "undefined") {
		global.Tar = f();
	} else if (typeof self !== "undefined") {
		self.Tar = f();
	} else {
		this.Tar = f();
		return true; // if "this" is the only option, return true, which, because of the ! is now false, otherwise this iife returns true
	}
})(function() {
	"use strict";
	const saveCaretPosition = function(editor) {
		const range = window.getSelection().getRangeAt(0);
		let prefix = range.cloneRange();
		prefix.selectNodeContents(editor);
		prefix.setEnd(range.endContainer, range.endOffset);
		return prefix.toString().length; // beforecursor.length kind of.
	}
	const restoreCaretPosition = function(pos, context) {
		for (const node of context.childNodes) { // check nodes
			if (node.nodeType == Node.TEXT_NODE) {
				if (node.length >= pos) {
					let range = document.createRange();
					let sel = window.getSelection();
					range.setStart(node, pos);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range); // it's the node
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
	const beforeCursor = function(editor) {
		const s = window.getSelection();
		const r0 = s.getRangeAt(0);
		const r = document.createRange();
		r.selectNodeContents(editor);
		r.setEnd(r0.startContainer, r0.startOffset);
		return r.toString();
	};
	const afterCursor = function(editor) {
		const s = window.getSelection();
		const r0 = s.getRangeAt(0);
		const r = document.createRange();
		r.selectNodeContents(editor);
		r.setStart(r0.endContainer, r0.endOffset);
		return r.toString();
	};
	const hasLeadingTabs = function(context) {
		const splice = beforeCursor(context);
		const endOfLine = splice.lastIndexOf("\n");

		const currentLine = splice.substr(endOfLine + 1);
		return currentLine.charAt(0) === "\t"; // has padding?
	};
	const getLeadingTabs = function (context) {
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
		return tabs; // get padding
	};
	return {
		initEditor : function(el, opts) {
			if (!el) return false; // return false if the el isn't specified
			let wrap = el; // it's a wrapper
			if (typeof opts !== "object") {
				opts = {tab:"\t", line_numbers: false}
			}
			if (!opts.tab) {
				opts.tab = "\t";
			}
			if (!opts.line_numbers) {
				opts.line_numbers = false;
			}
			if (!opts.highlight) {
				opts.highlight = function() {
					editor.innerHTML = editor.textContent;
				}
			}
			let editor = document.createElement("DIV"); // editor field
			editor.style.whiteSpace = "pre";
			editor.style.overflow = "hidden";
			editor.style.wordWrap = "normal";
			editor.addEventListener("focus", function(e) {
				editor.style.outline = "none"; // disable default styling.
			});
			editor.setAttribute("contenteditable", window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1 ? true : "plaintext-only");
			editor.setAttribute("spellcheck", false);
			editor.addEventListener("keydown", function(e) {
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
									splitBeforeText[i] = opts.tab + splitBeforeText[i] + "\n";
									document.execCommand("insertHTML", false, splitBeforeText[i]+"\n");
								}
								document.execCommand("delete");
								const pos = saveCaretPosition(editor);
								restoreCaretPosition(pos - beforeText.length-splitBeforeText.length+1, editor);
							} else {
								document.execCommand("delete");
								document.execCommand("insertHTML", false, opts.tab + beforeText);
								const pos = saveCaretPosition(editor);
								restoreCaretPosition(pos-beforeText.length, editor);
							}
						} else {
							document.execCommand("insertHTML", false, opts.tab);
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
							afterCursor(editor).trim().startsWith("}") ? document.execCommand("insertHTML", false, "\n\t\n\n") :  document.execCommand("insertHTML", false, "\n\t\n\n\n");
							const pos = saveCaretPosition(editor);
							restoreCaretPosition(pos-1, editor);
						}
					}
				}
			});
			wrap.overflow = "scroll";
			wrap.appendChild(editor);
			return {
				textContent : function() {
					return editor.textContent || "";
				},
				destroy : function() {
					editor.remove();
					return editor || undefined;
				},
				setOpt: function(newopts) {
					opts = newopts;
				}
			};
		},
		info : function() {
			return this.self + " Version " + this.version + " running on an environment with self value: " + this.global() + ".";
		},
		version: "1.0.0",
		self: "Tar",
		global: function() {
			if (typeof module !== "undefined" && typeof exports === "object") {
				return "module.exports";
			} else if (typeof window !== "undefined") {
				return "window";
			} else if (typeof global !== "undefined") {
				return "global";
			} else if (typeof self !== "undefined") {
				return "self";
			} else {
				return "this";
			}
		}
	}
});