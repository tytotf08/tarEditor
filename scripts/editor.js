"use strict";
// I rewrote parts of the editor from memory, but otherwise from scratch.
const input = document.querySelector("div#textarea");
const wrap = document.querySelector("div#editor");
// big changes: 
// not everything is in the global scope. one of the issues was that there was
// only a global scope in the editor, so it's rewritten to solve that.
// also, seperate js files! if you add up the lines when this editor has tabs and 
// I implement the lang choosing functionality, it'll probably be quite shorter than
// the previous editor
let prev = input.textContent;
let last;
const autocomplete = [
	{ open: "{", close: "}" },
	{ open: '"', close: '"' },
	{ open: "'", close: "'" },
	{ open: "`", close: "`" },
	{ open: "[", close: "]" },
	{ open: "(", close: ")" }
];
let incarnations = [
	{html: "", pos: 0}
];
let at = 0;
input.setAttribute("contenteditable", "plaintext-only");
input.setAttribute("spellcheck", false);
const getLines = function() {
	const lines = input.textContent.split(/\n(?!$)/g).length;
	line_numbers.innerHTML = "1\n";
	for (let i = 1; i < lines; i++) {
		line_numbers.innerHTML += String(i+1) + "\n";
	}
}
input.addEventListener("keydown", function(e) {
	if (e.key === "Tab") {
		e.preventDefault();
		if (e.shiftKey) {
			if (hasLeadingTabs(input)) {
				const splice = beforeCursor(input);
				const endOfLine = splice.lastIndexOf("\n");
				const currentLine = splice.substr(endOfLine + 1);
				const pos = saveCaretPosition();
				restoreCaretPosition(pos-currentLine.length+1, input);
				document.execCommand("delete");
				restoreCaretPosition(pos-1, input);
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
					const pos = saveCaretPosition();
					restoreCaretPosition(pos - beforeText.length-splitBeforeText.length+1, input);
				} else {
					document.execCommand("delete");
					document.execCommand("insertHTML", false, "\t" + beforeText);
					const pos = saveCaretPosition();
					restoreCaretPosition(pos-beforeText.length, input);
				}
			} else {
				document.execCommand("insertHTML", false, "\t");
			}
		}
	}
	if (e.key === "Enter") {
		const splice = beforeCursor(input);
		const endOfLine = splice.lastIndexOf("\n");
		const currentLine = splice.substr(endOfLine + 1);
		if (getLeadingTabs(input).length > 0) {
			e.preventDefault();
			if (!currentLine.trim().endsWith("{")) {
				document.execCommand("insertHTML", false, "\n"+getLeadingTabs(input));
			} else {
				const tabs = getLeadingTabs(input);
				document.execCommand("insertHTML", false, "\n"+tabs+"\t\n"+tabs);
				const pos = saveCaretPosition();
				restoreCaretPosition(pos-tabs.length-1, input);
			}
			
		} else {
			if (currentLine.trim().endsWith("{")) {
				e.preventDefault();
				afterCursor().trim().startsWith("}") ? document.execCommand("insertHTML", false, "\n\t\n\n") :  document.execCommand("insertHTML", false, "\n\t\n\n\n");
				const pos = saveCaretPosition();
				restoreCaretPosition(pos-1, input);
			}
		}
	}
	for (let i = 0; i < autocomplete.length; i++) {
		if (e.key === autocomplete[i].open) {
			e.preventDefault();
			if ((afterCursor().startsWith('"') || afterCursor().startsWith("'") || afterCursor().startsWith("`")) && (e.key === '"' || e.key === "'" || e.key === "`" )) {
				const pos = saveCaretPosition();
				restoreCaretPosition(pos, input);
			} else {
				if (String(window.getSelection()) !== "") {
					const beforeString = String(window.getSelection());
					document.execCommand("delete");
					document.execCommand("insertHTML", false, autocomplete[i].open+beforeString+autocomplete[i].close);
					const pos = saveCaretPosition();
					restoreCaretPosition(pos-1, input);
				} else {
					document.execCommand("insertHTML", false, autocomplete[i].open + autocomplete[i].close);
					const pos = saveCaretPosition();
					if (e.key === '"' || e.key === "`" || e.key === "'") {
						restoreCaretPosition(pos-2, input);
					} else {
						restoreCaretPosition(pos-1, input);
					}
				}
			}
		}
		if (e.key === "Backspace" && beforeCursor().endsWith(autocomplete[i].open) && afterCursor().startsWith(autocomplete[i].close)) {
			e.preventDefault();
			const pos = saveCaretPosition();
			restoreCaretPosition(pos+1, input);
			for (let i = 0; i < 2; i++) {
				document.execCommand("delete");
			}
		}
		if (e.key === autocomplete[i].close) {
			if (afterCursor().startsWith(autocomplete[i].close)) {
				e.preventDefault();
				const pos = saveCaretPosition();
				restoreCaretPosition(pos+1, input);
			}
		}
	}
	if (e.key === "Backspace") {
		const splice = beforeCursor(input);
		const endOfLine = splice.lastIndexOf("\n");
		const currentLine = splice.substr(endOfLine + 1);
		if (currentLine.length === 1 && afterCursor().split("\n")[0].length === 0) {
			e.preventDefault();
			const pos = saveCaretPosition();
			document.execCommand("insertHTML", false, "&nbsp;");
			restoreCaretPosition(pos, input);
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
		input.innerHTML = incarnations[at].html;
		restoreCaretPosition(incarnations[at].pos, input);
	}
	if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z") || ((e.ctrlKey || e.metaKey) && e.key === "y")) {
		e.preventDefault();
		at++;
		if (at > incarnations.length-1) {
			at = incarnations.length-1;
			return;
		}
		input.innerHTML = incarnations[at].html;
		restoreCaretPosition(incarnations[at].pos, input);
	}
	getLines();
});
input.addEventListener("keyup", function(e) {
	getLines();
	if (e.isComposing) return;
	if (String(window.getSelection()) !== "") return;
	const pos = saveCaretPosition();
	input.innerHTML = input.textContent
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
	Prism.highlightElement(input);
	window.setTimeout(function() {
		// if (prev === input.textContent) return;
		const html = input.innerHTML;
		const pos = saveCaretPosition();
		last = incarnations[at];
		if (last) {
			if (last.html === html && last.pos === last.pos) {
				return;
			}
		}
		at++;
		incarnations[at] = { html, pos };
	}, 150);
	restoreCaretPosition(pos, input);
});
input.addEventListener("input", function(e) {
	getLines();
	prev = input.textContent;
});
wrap.addEventListener("scroll", function(e) {
	const editorScrollBottom = this.scrollTop + window.innerHeight - window.getComputedStyle(document.querySelector("div#status-bar"), null).height.replace(/[a-z]/g, "");
	if (this.scrollTop < 0) {
		e.preventDefault();
		this.scrollTop = 0;
	} else if (editorScrollBottom > editor.scrollHeight) {
		e.preventDefault();
		this.scrollTop = editorScrollBottom;
	}
});
window.onload = function() {
	input.focus();
}