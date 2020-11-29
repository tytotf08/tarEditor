;(function(_self, lib){
	if (typeof module !== "undefined" && typeof exports === "object") {
		module.exports = lib();
	} else {
		_self().Tar = lib();
	}
})(function() {
	if (typeof window !== "undefined") {
		return window;
	} else if (typeof global !== "undefined") {
		return global;
	} else if (typeof self !== "undefined") {
		return self;
	} else {
		return this;
	}
}, function() {
	return {
		init: function(el, hl) {
			let baseRange,c,currentLine,currentLine1,currentLine2, sel, endOfLine,gutterC,html,i,index,last,len,lines,node,NODE_TYPE,pos,prefix,prev,r,range,rangeWeAreUsing,restore,savedRange,splice,tabs,text,treeWalker,theKey;
			let indexLines = "";
			let incarnations = [{html:"", pos: 0}];
			let at = 0;
			let gutter;
			let newtabs;
			const highlight = function() {
				pos = saveCaretPosition(el);
				el.textContent = el.textContent;
				hl(el);
				restoreCaretPosition(pos, el);
				getLines();
			}
			const autoComplete = [
				{open: "{", close: "}"}, 
				{open: "\"", close: "\""}, 
				{open: "'", close: "'"}, 
				{open: "`", close: "`"},
				{open: "[", close: "]"},
				{open: "(", close: ")"}
			];
			el.contentEditable = "plaintext-only";
			prev = "";
			const diff = function() {
				return prev !== el.textContent;
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
				html = el.innerHTML;
				pos = saveCaretPosition(el);
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
				r.selectNodeContents(el);
				r.setEnd(r0.startContainer, r0.startOffset);
				return r.toString();
			}	
			const afterCursor = function() {
				const s = window.getSelection();
				const r0 = s.getRangeAt(0);
				const r = document.createRange();
				r.selectNodeContents(el);
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
			el = el;
			highlight(el);
			el.addEventListener("keydown", function(e) {
				if (diff()) {
					prev = el.textContent;
				}
				if (e.key === ">" && el.getAttribute("class").includes("markup")) {
					text = beforeCursor().split(">");
					console.log(text);
					if (text[text.length-1] !== "") {
						if (text[text.length-1].replace("\s", "").startsWith("<")) {
							e.preventDefault();
							insertText("></"+text[text.length-1].replace("<", "")+">");
							pos = saveCaretPosition(el);
							restoreCaretPosition(pos-text[text.length-1].replace("<", "").length-3, el);
						}
					}  
				}
				if (e.key === "Enter") {	
					splice = beforeCursor(el);
					endOfLine = splice.lastIndexOf("\n");

					currentLine = splice.substr(endOfLine+1);
					tabs = getLeadingTabs(el);
					if (tabs.length > 0) {
						e.preventDefault();
						if (currentLine.replace(/\s/g, "").endsWith("{") || currentLine.replace(/\s/g, "").endsWith("[")) {
							insertText("\n"+tabs+"\t\n"+tabs);
							console.log(tabs);
							pos = saveCaretPosition(el);
							restoreCaretPosition(pos-(tabs.length+1), el);
						} else {
							insertText("\n"+tabs);
						}
					} else {
						if (currentLine.replace(/\s/g, "").endsWith("{") || currentLine.replace(/\s/g, "").endsWith("[")) {
							e.preventDefault();
							insertText("\n\t\n\n");
							pos = saveCaretPosition(el);
							restoreCaretPosition(pos-1, el);
						}
					}
				}
				for (i = 0; i < autoComplete.length; i++) {
					if (e.key === autoComplete[i].open) {
						e.preventDefault();
						if ((afterCursor().startsWith("\"") || afterCursor().startsWith("'")) && (e.key === '"' || e.key === "'")) {
							pos = saveCaretPosition(el);
							restoreCaretPosition(pos+1, el);
							break;
						} else {
							if (String(window.getSelection()) === "") {
								insertText(autoComplete[i].open + autoComplete[i].close);
								pos = saveCaretPosition(el);
								restoreCaretPosition(pos-1, el);
								break;
							} else {
								theKey = autoComplete[i];
								sel = String(window.getSelection());
								document.execCommand("delete");
								insertText(theKey.open+sel+theKey.close);
								pos = saveCaretPosition(el);
								restoreCaretPosition(pos-1, el);
								break;
							}
						}
					}
					if (e.key === autoComplete[i].close) {
						if (afterCursor().startsWith(autoComplete[i].close)) {
							e.preventDefault();
							pos = saveCaretPosition(el);
							restoreCaretPosition(pos+1, el);
							break;
						} else {
							continue;
						}
					}
					if (e.key === "Backspace" && beforeCursor().endsWith(autoComplete[i].open) && afterCursor().startsWith(autoComplete[i].close)) {
						pos = saveCaretPosition(el);
						restoreCaretPosition(pos+1, el);
						for (i = 0; i < 2; i++) {
							document.execCommand("delete");
						}
						break;
					}
					if (e.key === "Backspace" && beforeCursor().endsWith(autoComplete[i].open + autoComplete[i].close)) {
						for (i = 0; i < 2; i++) {
							document.execCommand("delete");
						}
					}
				}
				if (e.key === "Backspace") {
					if (beforeCursor().split("\n")[beforeCursor().split("\n").length-1].length === 1 && !el.textContent.length === 1) {
						e.preventDefault();
						document.execCommand("delete");
						insertText("\n\n");
					}
				}
				if (e.key === "Tab") {
					e.preventDefault();
					if (e.shiftKey) {
						pos = saveCaretPosition(el);
						html = el.textContent;
						splice = beforeCursor(el);
						endOfLine = splice.lastIndexOf("\n");
						console.log(endOfLine);
						splice = splice.split("\n");
						console.log(splice);
						currentLine = splice[splice.length-1];
						if (currentLine.startsWith("\t")) {
							splice[splice.length-1] = currentLine.substring(1);
							el.textContent = html.replace(beforeCursor(el), splice.join("\n"));
							Prism.highlightElement(el);
							restoreCaretPosition(pos-1, el);
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
						el.innerHTML = incarnations[at].html;
						restoreCaretPosition(incarnations[at].pos, el);
					}
					if (at > incarnations.length) {
						at--;
					}
				}
				if (isUndo(e)) {
					console.log(at);
					e.preventDefault();
					at--;
					console.log(at);
					if (incarnations[at]) {
						el.innerHTML = incarnations[at].html;
						restoreCaretPosition(incarnations[at].pos, el);
					}
					if (at < 0) {
						at = 0;
					}
				}
			});
			
		}
	};
});