(()=>{"use strict";var t={};t.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}();const e=(t,i)=>{for(const s of i.childNodes)if(s.nodeType==Node.TEXT_NODE){if(s.length>=t){let e=document.createRange(),i=window.getSelection();return e.setStart(s,t),e.collapse(!0),i.removeAllRanges(),i.addRange(e),-1}t-=s.length}else if((t=e(t,s))<0)return t;return t},i=e,s={start:['"',"'","`","{","[","("],end:['"',"'","`","}","]",")"]},r=t=>t[t.length-1];class n{constructor(t,e=(()=>{}),s=!1){return t instanceof Node&&(this.hl=e,this.ln=s,this.wrap=t,this.scroller=document.createElement("DIV"),this.textarea=document.createElement("DIV"),(o=this.textarea).setAttribute("contenteditable",navigator.userAgent.toLowerCase().indexOf("firefox")>-1||"plaintext-only"),o.setAttribute("spellcheck",!1),o.classList.add("tar-textarea"),o.style.whiteSpace="pre",o.style.wordWrap="normal",o.style.overflowY="hidden",o.style.padding="6px",o.style.outline="0px solid transparent",o.style.flex=1,this.prev=this.textarea.textContent,this.timeMachine=[{html:"",pos:0}],this.at=0,this.editor={on:(t,e)=>{this.textarea.addEventListener(t,e)},innerHTML:()=>this.textarea.innerHTML,textContent:()=>this.textarea.textContent,diff:t=>{"function"==typeof t&&this.prev!==this.editor.textContent()&&t()},refresh:()=>{this.prev=this.editor.textContent()},before:()=>(t=>{const e=window.getSelection().getRangeAt(0),i=document.createRange();return i.selectNodeContents(t),i.setEnd(e.startContainer,e.startOffset),i.toString()})(this.textarea),after:()=>(t=>{const e=window.getSelection().getRangeAt(0),i=document.createRange();return i.selectNodeContents(t),i.setStart(e.endContainer,e.endOffset),i.toString()})(this.textarea),save:()=>this.editor.before().length,restore:t=>i(t,this.textarea),insert:(t="")=>{const e=this.editor.before()+t+this.editor.after(),i=this.editor.save();this.textarea.textContent=e,this.editor.restore(i+t.length)},setHTML:(t="")=>{this.textarea.innerHTML=t}},this.editor.on("keydown",(t=>{this.editor.refresh();const e=this.indent(t),i=this.enter(t),s=this.autoComplete(t);if(!0===e||!0===i||!0===s){const t=this.editor.save(),e=this.editor.textContent().replace(/</g,"&lt;").replace(/>/g,"&lt;");this.editor.setHTML(e),this.hl(this.textarea),this.editor.restore(t)}if(this.setVer(t),this.delete(t),this.lineNumbers){this.lineNumbers.innerHTML="1<br>";const t=this.editor.textContent().split(/\n(?!$)/g).length;for(let e=1;e<t;e++)this.lineNumbers.innerHTML+=String(e+1)+"<br>"}})),this.editor.on("keyup",(t=>{t.isComposing||this.editor.diff((()=>{const t=this.editor.save(),e=this.editor.textContent().replace(/</g,"&lt;").replace(/>/g,"&lt;");this.editor.setHTML(e),this.hl(this.textarea),this.editor.restore(t),this.editor.innerHTML().split("\n"),window.setTimeout((()=>{if(this.timeMachine[this.at].html===this.editor.innerHTML())return;this.at++;const t=this.editor.innerHTML(),e=this.editor.save();this.timeMachine.push({html:t,pos:e})}),300)}))})),this.editor.on("input",(t=>{if(this.lineNumbers){this.lineNumbers.innerHTML="1<br>";const t=this.editor.textContent().split(/\n(?!$)/g).length;for(let e=1;e<t;e++)this.lineNumbers.innerHTML+=String(e+1)+"<br>"}})),(n=this.scroller).style.flex=1,n.classList.add("tar-scroller"),n.style.overflow="auto",n.style.display="flex",n.style.alignItems="flex-start",(t=>{t.classList.add("tar-wrap"),t.style.display="flex",t.style.flexDirection="column",t.style.overflow="hidden"})(this.wrap),!0===this.ln&&(this.lineNumbers=document.createElement("DIV"),(r=this.lineNumbers).classList.add("tar-linenumbers"),r.style.width="3%",r.innerHTML="1<br>",r.style.paddingTop="6px",r.style.textAlign="center",this.textarea.style.flex="97%",this.scroller.appendChild(this.lineNumbers)),this.scroller.appendChild(this.textarea),this.wrap.appendChild(this.scroller),this);var r,n,o}indent(t){if("Tab"===t.key){if(t.preventDefault(),t.shiftKey);else{const t=String(window.getSelection());this.editor.insert("\t"+t);const e=this.editor.save();this.editor.restore(e-t.length)}return!0}return!1}enter(t){if("Enter"===t.key){const e=r(this.editor.before().split("\n"));let i="",s=0;for(;"\t"===e.charAt(s);)i+="\t",s++;if(e.endsWith("{")&&this.editor.after().startsWith("}")){t.preventDefault(),this.editor.insert("\n"+i+"\t");const e=this.editor.save();this.editor.insert("\n"+i),this.editor.restore(e)}else i.length>0&&(t.preventDefault(),this.editor.insert("\n"+i));return!0}return!1}autoComplete(t){for(let e=0;e<s.start.length;e++){if(t.key===s.start[e]){if(t.preventDefault(),s.start[e]===s.end[e]&&this.editor.before().endsWith(s.start[e])&&this.editor.after().startsWith(s.end[e])){const t=this.editor.save()+1;this.editor.restore(t)}else{this.editor.insert(s.start[e]+s.end[e]);const t=this.editor.save()-1;this.editor.restore(t)}return!0}if(t.key===s.end[e]){if(this.editor.before().endsWith(s.start[e])&&this.editor.after().startsWith(s.end[e])){t.preventDefault();const e=this.editor.save()+1;this.editor.restore(e)}return!0}}}setVer(t){return t.shiftKey||!t.ctrlKey&&!t.metaKey||"z"!==t.key?!(!t.shiftKey||!t.ctrlKey&&!t.metaKey||"z"!==t.key||(t.preventDefault(),this.at++,this.at>=this.timeMachine.length?this.at=this.timeMachine.length-1:(this.editor.setHTML(this.timeMachine[this.at].html),this.editor.restore(this.timeMachine[this.at].pos)),0)):(t.preventDefault(),this.at--,this.at<0?this.at=0:(this.editor.setHTML(this.timeMachine[this.at].html),this.editor.restore(this.timeMachine[this.at].pos)),!0)}delete(t){return"Backspace"===t.key&&(r(this.editor.innerHTML().split("\n")),!0)}}const o={init:(t,e,i)=>new n(t,e,i)};("undefined"!=typeof window?window:void 0!==t.g?t.g:"undefined"!=typeof self?self:void 0).tar=o})();