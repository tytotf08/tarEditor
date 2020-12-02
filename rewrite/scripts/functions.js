"use strict";
const saveCaretPosition = function() {
	const range = window.getSelection().getRangeAt(0);
	let prefix = range.cloneRange();
	prefix.selectNodeContents(input);
	prefix.setEnd(range.endContainer, range.endOffset);
	return prefix.toString().length;
}
const restoreCaretPosition = function(pos, context) {
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
const beforeCursor = function () {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(input);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
};
const afterCursor = function () {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(input);
	r.setStart(r0.endContainer, r0.endOffset);
	return r.toString();
};
const hasLeadingTabs = function (context) {
	const splice = beforeCursor(context);
	const endOfLine = splice.lastIndexOf("\n");
	const currentLine = splice.substr(endOfLine + 1);
	return currentLine.charAt(0) === "\t";
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
	return tabs;
};
const switchLanguage = function (lang) {
	const pos = saveCaretPosition(input);
	input.setAttribute("class", "language-" + lang);
	restoreCaretPosition(pos, input);
	window.setTimeout(function () {
		input.focus();
	}, 0);
	Prism.highlightElement(input);
};
const isJS = function() {
	switchLanguage("javascript");
};
const isHTML = function() {
	switchLanguage("markup");
};
const isCSS = function() {
	switchLanguage("css");
};
const isMD = function() {
	switchLanguage("markdown");
}