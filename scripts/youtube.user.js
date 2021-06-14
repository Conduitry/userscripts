// ==UserScript==
// @name YouTube thing
// @namespace https://chor.date
// @description A script to unset autoplay and display hidden video tags.
// @match https://www.youtube.com/*
// @icon https://www.youtube.com/favicon.ico
// @version 2021.06.14.211919
// ==/UserScript==

const disable_autoplay = async () => {
	for (;;) {
		const el = document.querySelector('.ytp-autonav-toggle-button[aria-checked]');
		if (el) {
			if (el.getAttribute('aria-checked') === 'true') {
				el.click();
			} else {
				return;
			}
		}
		await new Promise(res => setTimeout(res, 1000));
	}
};

const set_tags = async () => {
	for (;;) {
		const el = document.querySelector('h1.title.ytd-video-primary-info-renderer');
		if (el) {
			el.title = document.querySelector('meta[name=keywords]').content;
			return;
		}
		await new Promise(res => setTimeout(res, 1000));
	}
};

if (location.pathname === '/watch') {
	disable_autoplay();
	set_tags();
}
