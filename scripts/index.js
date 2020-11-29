"use strict";
const editor = document.querySelector("div#editor");
const line_numbers = document.querySelector("div#line-numbers");
let baseRange,c,currentLine,currentLine1,currentLine2, sel, endOfLine,gutterC,html,i,index,last,len,lines,node,NODE_TYPE,pos,prefix,prev,r,range,rangeWeAreUsing,restore,savedRange,splice,tabs,text,treeWalker,theKey;
let indexLines = "";
let focused = true;
let incarnations = [{html:"", pos: 0}];
let at = 0;
let gutter;
let newtabs;
let editorScrollBottom = this.scrollTop + window.innerHeight - window.getComputedStyle(document.querySelector("div#status-bar"), null).height.replace(/[a-z]/g, "");
const autoComplete = [
	{open: "{", close: "}"}, 
	{open: "\"", close: "\""}, 
	{open: "'", close: "'"}, 
	{open: "`", close: "`"},
	{open: "[", close: "]"},
	{open: "(", close: ")"}
];
const diff = function() {
	return prev !== editor.textContent;
};
const handleKey = function(e) {
	getLines();
	if (diff()) {
		prev = editor.textContent;
	}
	if (e.key === ">" && editor.getAttribute("class").includes("markup")) {
		text = beforeCursor().split(">");
		if (text[text.length-1] !== "") {
			if (text[text.length-1].trim().startsWith("<")) {
				e.preventDefault();
				if (text[text.length-1] === "<!DOCTYPE html") {
					insertText(">");
				} else {
					insertText("></"+text[text.length-1].replace("<", "").trim()+">");
					pos = saveCaretPosition(editor);
					restoreCaretPosition(pos-text[text.length-1].replace("<", "").trim().length-3, editor);
				}
			}
		}  
	}
	if (e.key === "Enter") {	
		splice = beforeCursor(editor);
		endOfLine = splice.lastIndexOf("\n");

		currentLine = splice.substr(endOfLine+1);
		tabs = getLeadingTabs(editor);
		console.log(currentLine.split("<"));
		if (tabs.length > 0) {
			e.preventDefault();
			if ((currentLine.replace(/\s/g, "").endsWith("{") || currentLine.replace(/\s/g, "").endsWith("[")) || editor.getAttribute("class").includes("markup") && currentLine.split("<")[currentLine.split("<").length-1].length > 1 && currentLine.split("<")[currentLine.split("<").length-1].endsWith(">")) {
				insertText("\n"+tabs+"\t\n"+tabs);
				console.log(tabs);
				pos = saveCaretPosition(editor);
				restoreCaretPosition(pos-(tabs.length+1), editor);
			} else {
				insertText("\n"+tabs);
			}
		} else {
			if ((currentLine.replace(/\s/g, "").endsWith("{") || currentLine.replace(/\s/g, "").endsWith("[")) || editor.getAttribute("class").includes("markup") && currentLine.split("<")[currentLine.split("<").length-1].length > 1 && currentLine.split("<")[currentLine.split("<").length-1].endsWith(">")) {
				e.preventDefault();
				insertText("\n\t\n\n");
				pos = saveCaretPosition(editor);
				restoreCaretPosition(pos-1, editor);
			}
		}
		getLines();
	}
	for (i = 0; i < autoComplete.length; i++) {
		if (e.key === autoComplete[i].open) {
			e.preventDefault();
			if ((afterCursor().startsWith("\"") || afterCursor().startsWith("'")) && (e.key === '"' || e.key === "'")) {
				pos = saveCaretPosition(editor);
				restoreCaretPosition(pos+1, editor);
				break;
			} else {
				if (String(window.getSelection()) === "") {
					insertText(autoComplete[i].open + autoComplete[i].close);
					pos = saveCaretPosition(editor);
					restoreCaretPosition(pos-1, editor);
					break;
				} else {
					theKey = autoComplete[i];
					sel = String(window.getSelection());
					document.execCommand("delete");
					insertText(theKey.open+sel+theKey.close);
					pos = saveCaretPosition(editor);
					restoreCaretPosition(pos-1, editor);
					break;
				}
			}
		}
		if (e.key === autoComplete[i].close) {
			if (afterCursor().startsWith(autoComplete[i].close)) {
				e.preventDefault();
				pos = saveCaretPosition(editor);
				restoreCaretPosition(pos+1, editor);
				break;
			} else {
				continue;
			}
		}
		if (e.key === "Backspace" && beforeCursor().endsWith(autoComplete[i].open) && afterCursor().startsWith(autoComplete[i].close)) {
			pos = saveCaretPosition(editor);
			restoreCaretPosition(pos+1, editor);
			for (i = 0; i < 2; i++) {
				document.execCommand("delete");
			}
			break;
		}
	}
	if (e.key === "Backspace") {
		if (beforeCursor().split("\n")[beforeCursor().split("\n").length-1].length === 1 && !editor.textContent.length === 1) {
			e.preventDefault();
			document.execCommand("delete");
			insertText("\n\n");
		}
	}
	if (e.ctrlKey && e.key === "r") {
		console.log("f");
	}
	if (e.key === "Tab") {
		e.preventDefault();

		if (e.shiftKey) {
			pos = saveCaretPosition(editor);
			html = editor.textContent;
			splice = beforeCursor(editor);
			endOfLine = splice.lastIndexOf("\n");
			console.log(endOfLine);
			splice = splice.split("\n");
			console.log(splice);
			currentLine = splice[splice.length-1];
			if (currentLine.startsWith("\t")) {
				splice[splice.length-1] = currentLine.substring(1);
				editor.textContent = html.replace(beforeCursor(editor), splice.join("\n"));
				Prism.highlightElement(editor);
				restoreCaretPosition(pos-1, editor);
				getLines();

			}
		} else {
			if (String(window.getSelection()) === "") {
				insertText("\t");
			} else {
				sel = String(window.getSelection());
				document.execCommand("delete");
				insertText("\t" + sel);
			}
		}
	}
	if (isRedo(e)) {
		e.preventDefault();
		at++;
		if (incarnations[at]) {
			editor.innerHTML = incarnations[at].html;
			restoreCaretPosition(incarnations[at].pos, editor);
		}
		if (at > incarnations.length) {
			at--;
		}
		getLines();
	}
	if (isUndo(e)) {
		console.log(at);
		e.preventDefault();
		at--;
		console.log(at);
		if (incarnations[at]) {
			editor.innerHTML = incarnations[at].html;
			restoreCaretPosition(incarnations[at].pos, editor);
		}
		if (at < 0) {
			at = 0;
		}
		getLines();
	}
};
const switchLanguage = function(lang) {
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-"+lang);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 0);
	Prism.highlightElement(editor);
};
const isJS = function() {
	switchLanguage("javascript");
};
const isHTML = function() {
	switchLanguage("markup");
}
const isCSS = function() {
	switchLanguage("css");
}
const isCmd = function(e) {
	return e.metaKey || e.ctrlKey;
};
const isShift = function(e) {
	return e.shiftKey;
};
const isUndo = function(e) {
	return isCmd(e) && !isShift(e) && e.key === "z";
};
const isRedo = function(e) {
	return (isCmd(e) && isShift(e) && e.key === "z") || (isCmd(e) && !isShift(e) && e.key === "y");
};
const isTimeToRecord = function(e) {
	return !isRedo(e) && !isUndo(e) && !e.metaKey && !e.ctrlKey && !e.altKey && !e.key.startsWith("Arrow");
};
const record = function() {
	if (!focus) return;
	html = editor.innerHTML;
	pos = saveCaretPosition(editor);
	;
	last = incarnations[at];
	if (last) {
		if (last.html === html && last.pos === last.pos) {
			return;
		}
	}
	at++;
	incarnations[at] = {html, pos};
};
const waitToRecord = function(event) {
	window.setTimeout(function(e) {
		highlight(); // so, if we undo to a non-highlighted token, it will always be highlighted
		if (isTimeToRecord(event)) {
			record();
		}
	}, 150);
};
const insertText = function(text) {
	text = text
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
	document.execCommand("insertHTML", false, text);
};
const saveCaretPosition = function(context){
	range = window.getSelection().getRangeAt(0);
	prefix = range.cloneRange();
	prefix.selectNodeContents(context);
	prefix.setEnd(range.endContainer, range.endOffset);
	return prefix.toString().length;
};
const restoreCaretPosition = function(pos, context) {
	for (node of context.childNodes) {
		if (node.nodeType == Node.TEXT_NODE) {
			if (node.length >= pos) {
				range = document.createRange();
				sel = window.getSelection();
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
const beforeCursor = function() {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(editor);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
}	
const afterCursor = function() {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(editor);
	r.setStart(r0.endContainer, r0.endOffset);
	return r.toString();
}
const hasLeadingTabs = function(context) {
	splice = beforeCursor(context);
	endOfLine = splice.lastIndexOf("\n");

	currentLine = splice.substr(endOfLine+1);
	return currentLine.charAt(0) === "\t";
};
const getLeadingTabs = function(context) {
	splice = beforeCursor(context);
	endOfLine = splice.lastIndexOf("\n");

	currentLine = splice.substr(endOfLine+1);

	tabs = "";
	newtabs = "";
	index = 0;
	while (currentLine.charAt(index++) === "\t") {
		tabs += "\t";
	}
	newtabs = tabs;
	return tabs;
};
const getLines = function() {
	lines = editor.textContent.split(/\n(?!$)/g).length;
	line_numbers.innerHTML = "";
	indexLines = ["1\n"];
	for (i=1;i<lines;i++) {
		indexLines.push((i+1)+"\n");
	}
	gutterC = indexLines.join("");
	line_numbers.innerHTML = gutterC;
	document.querySelector("div#lines").innerHTML = "Lines: " + indexLines[indexLines.length-1];
}
const highlight = function() {
	pos = saveCaretPosition(editor);
	editor.textContent = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	getLines();
};
const waitToHighlight = function() {
	window.setTimeout(function() {
		highlight();
	}, 50);
};
editor.addEventListener("keydown", function(e) {
	handleKey(e);
});
editor.addEventListener("keyup", function(e) {
	getLines();
	if (e.isComposing) return;
	range = window.getSelection();
	if (range.toString() !== "") return; // cmd-a
	if (diff()){
		waitToHighlight();
	}
	waitToRecord(e);
});
editor.addEventListener("input", function(e) {
	getLines();
	highlight();
});
editor.addEventListener("paste", function(e) {
	e.preventDefault();
	text = (e.originalEvent || e).clipboardData.getData("text/plain");
	insertText(text);
	pos = saveCaretPosition(editor);
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
});
editor.addEventListener("focus", function(e) {
	focused = true;
});
editor.addEventListener("blur", function(e) {
	focused = false;
});
document.querySelector("div#wrap").addEventListener("scroll", function(e) {
	editorScrollBottom = this.scrollTop + window.innerHeight - window.getComputedStyle(document.querySelector("div#status-bar"), null).height.replace(/[a-z]/g, "")
	if (this.scrollTop < 0) {
		e.preventDefault();
		this.scrollTop = 0;
	} else if (editorScrollBottom > editor.scrollHeight) {
		e.preventDefault();
		this.scrollTop = editorScrollBottom;			
	}
});
document.querySelector("div#r").addEventListener("click", function(e) {
	window.open(" ", "_blank").document.write(editor.textContent || "");
});
document.querySelector("select#lang").addEventListener("change", function(e) {
	if (this.value === "JavaScript") {
		console.log("f");
		isJS();
	}
	if (this.value === "HTML") {
		isHTML();
	}
	if (this.value === "CSS") {
		isCSS();
	}
});
document.addEventListener("DOMContentLoaded", function(e) {
	Prism.highlightElement(editor);
});
window.addEventListener("load", function(e) {
	getLines();
	editor.focus();
});