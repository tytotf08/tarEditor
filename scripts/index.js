"use strict"; 
const editor = document.querySelector("div#editor");
const langChooser = document.querySelector("select#lang"); 
let NODE_TYPE, baseRange, c, currentLine, endOfLine, html, i, index, isInFocus, last, len, oldArray, pos, prefix, prev, r, range, rangeWeAreUsing, restore, savedRange, selection, splice, tabs, text, treeWalker;
let focused = true;
let atInfo = {};
let incarnations = [];
let at = 0;
let instanceIsComposing = false;
let recording;
let isInBrackets = false;
let num = "1\n";
let line = 1;
let splitText;
let tester;
const diff = function() {
	return prev !== editor.textContent;
};
const testNum = function() {
	tester = num;
	return tester;
};
const handleKey = function(e) {
	if (diff()) {
		prev = editor.textContent;
	}
	if (e.key === "Enter") {
		tabs = getLeadingTabs(editor);
		if (tabs.length > 0) {
			e.preventDefault();
			insertText("\n"+tabs);
		}
	}
	if (e.key === "Tab") {
		e.preventDefault();
		insertText("\t");
	}
	if (e.key === "Backspace") {
		e.preventDefault();
		document.execCommand("delete");
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
	}
	if (isUndo(e)) {
		e.preventDefault();
		at--;
		if (incarnations[at]) {
			editor.innerHTML = incarnations[at].html;
			restoreCaretPosition(incarnations[at].pos, editor);
		}
		if (at < 0) {
			at = 0;
		}
	}
}
const isJS = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-javascript");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
}
const isHTML = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-markup");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
}
const isCSS = function() {
	html = editor.textContent;
	pos = saveCaretPosition(editor);
	editor.setAttribute("class", "language-css");
	editor.innerHTML = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
	window.setTimeout(function() {
		editor.focus();
	}, 50);
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
	console.log(pos);
	last = incarnations[at];
	if (last) {
		if (last.html === html && last.pos === last.pos) {
			return;
		}
	}
	at++;
	incarnations[at] = {html, pos};
	console.log(incarnations[at]);
	console.log(incarnations);
};
const waitToRecord = function(event) {
	window.setTimeout(function(e) {
		highlight(); // so, if we undo to a non-highlighted token, it will always be highlighted
		if (isTimeToRecord(event)) {
			record();
			recording = false;
		}
	}, 100);
};
const insertText = function(text) {
	text = text
		.replace(/&/g, "&amp;")
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
	for (const node of context.childNodes) {
	  if (node.nodeType == Node.TEXT_NODE) {
			if (node.length >= pos) {
			  const range = document.createRange();
			  const sel = window.getSelection();
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
const beforeCursor = function(context) {
	baseRange = window.getSelection().getRangeAt(0);
	rangeWeAreUsing = document.createRange();
	rangeWeAreUsing.selectNodeContents(context);
	rangeWeAreUsing.setEnd(baseRange.startContainer, baseRange.startOffset);
	return String(rangeWeAreUsing);
};
const getLeadingTabs = function(context) {
	splice = beforeCursor(context);
	endOfLine = splice.lastIndexOf("\n");

	currentLine = splice.substr(endOfLine+1);

	tabs = "";
	index = 0;
	while (currentLine.charAt(index++) === "\t") {
		tabs += "\t";
	}
	if (currentLine.trim().endsWith("{")) {
		tabs += "\t";
	}
	return tabs;
};
const highlight = function() {
	pos = saveCaretPosition(editor);
	editor.textContent = editor.textContent;
	Prism.highlightElement(editor);
	restoreCaretPosition(pos, editor);
};
const waitToHighlight = function() {
	window.setTimeout(function() {
		splitText = editor.textContent.split("\n");
		splitText = splitText.length;
		num = "";
		console.log(num);
		for (i = 0; i < splitText; i++) {
			num+=String(i+1);
		}
		if (num !== "1") {
			num = num.split("")
			num.pop();
			num = num.join("");
		}
		document.querySelector("div#status-bar span#line").innerHTML = "Lines: " + testNum().split("").pop();
		console.log(num);
		highlight();
	}, 50);
};
editor.addEventListener("keydown", function(e) {
	handleKey(e);
});
editor.addEventListener("keyup", function(e) {
	if (e.isComposing) return;
	range = window.getSelection();
  if (range.toString() !== "") return; // cmd-a
	if (diff()){
		waitToHighlight();
	}
	waitToRecord(e);
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
langChooser.addEventListener("change", function(e) {
	e.preventDefault();
	if (e.target.value === "JavaScript") isJS();
	if (e.target.value === "HTML") isHTML();
	if (e.target.value === "CSS") isCSS();;
});
document.addEventListener("DOMContentLoaded", function(e) {
	Prism.highlightElement(editor);
});
window.addEventListener("load", function(e) {
	editor.focus();
});