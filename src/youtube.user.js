// ==UserScript==
// @name YouTube thing
// @namespace https://chor.date
// @description A script to unset autoplay.
// @match https://www.youtube.com/*
// @icon https://www.youtube.com/favicon.ico
// @version 0
// ==/UserScript==

(async () => {
	let el;
	if (location.pathname === '/watch') {
		while (!(el = document.querySelector('.ytd-compact-autoplay-renderer[role=button]'))) {
			await new Promise(res => setTimeout(res, 100));
		}
		if (el.getAttribute('aria-pressed') === 'true') {
			el.dispatchEvent(new MouseEvent('click'));
		}
	}
})();
