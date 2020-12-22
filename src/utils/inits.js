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