// ==UserScript==
// @name YouTube thing
// @namespace https://chor.date
// @description A script to unset autoplay and display hidden video tags.
// @match https://www.youtube.com/*
// @icon https://www.youtube.com/favicon.ico
// @version 2020.08.24.031122
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
		const tags = [...document.querySelectorAll('meta[property="og:video:tag"]')].map(el => el.content).join(', ');
		document.querySelectorAll('h1.title').forEach(el => el.title = tags);
	}
})();
