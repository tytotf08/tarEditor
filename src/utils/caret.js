export const rC = (pos, context) => {
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
			pos = rC(pos, node);
			if (pos < 0) {
				return pos;
			}
		}
	}
	return pos;
};
export const bC = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setEnd(r0.startContainer, r0.startOffset);
	return r.toString();
};
export const aC = (el) => {
	const s = window.getSelection();
	const r0 = s.getRangeAt(0);
	const r = document.createRange();
	r.selectNodeContents(el);
	r.setStart(r0.endContainer, r0.endOffset);
	return r.toString();
};