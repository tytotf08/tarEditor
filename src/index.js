import * as c from "./class.js";
const _self = typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this;
const tar = {
	init: (wrap, ln) => {
		return new c.Tar(wrap, ln);
	}
};
_self.tar = tar;