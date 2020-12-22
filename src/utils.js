export const specialChars = {
	start: [
		"\"", "'", "`", "{", "["
	],
	end: [
		"\"", "'", "`", "}", "]"
	]
};
export const lastOf = a => {
	return a[a.length-1];
};
export const restoreCaretPosition = (pos, context) => {
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
export const beforeCursor = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
};
export const afterCursor = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setStart(r0.endContainer, r0.endOffset);
	return r.toString();
};
export const initWrap = wrap => {
	wrap.classList.add("tar-wrap");
	wrap.style.display = "flex";
	wrap.style.flexDirection = "column";
	wrap.style.overflow = "hidden";
};
export const initScroller = scroller => {
	scroller.style.flex = 1;
	scroller.classList.add("tar-scroller");
	scroller.style.overflow = "auto";
	scroller.style.display = "flex";
	scroller.style.alignItems = "flex-start";
};
export const initTextarea = textarea => {
	textarea.setAttribute("contenteditable", navigator.userAgent.toLowerCase().indexOf("firefox") > -1 ||"plaintext-only");
	textarea.setAttribute("spellcheck", false);
	textarea.classList.add("tar-textarea");
	textarea.style.whiteSpace = "pre";
	textarea.style.wordWrap = "normal";
	textarea.style.overflowY = "hidden";
	textarea.style.padding = "6px";
	textarea.style.outline = "0px solid transparent";
	textarea.style.flex = 1;
};
export const initLineNumbers = lineNumbers => {
	lineNumbers.style.width = "3%";
	lineNumbers.innerHTML = "1<br>";
	lineNumbers.style.paddingTop = "6px";
	lineNumbers.style.textAlign = "center";
}