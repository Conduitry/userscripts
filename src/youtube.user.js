// ==UserScript==
// @name YouTube thing
// @namespace https://chor.date
// @description A script to unset autoplay.
// @match https://www.youtube.com/*
// @icon https://www.youtube.com/favicon.ico
// @version 0
// ==/UserScript==

setTimeout(() => {
	const el = document.querySelector('.ytd-compact-autoplay-renderer[role=button][aria-pressed=true]');
	if (el) {
		el.dispatchEvent(new MouseEvent('click'));
	}
}, 5000);
