// ==UserScript==
// @name New York Times thing
// @namespace https://chor.date
// @description A script to bypass the paywall, mostly.
// @match https://www.nytimes.com/*
// @icon https://www.nytimes.com/favicon.ico
// @version 2022.09.23.035748
// ==/UserScript==

(async () => {
	for (let i = 0; i < 100; i++) {
		const el = document.querySelector('#gateway-content');
		if (el) {
			el.remove();
			document.querySelector('#app > div > div').className = '';
			document.querySelector('#app > div > div > div:last-child').remove();
			break;
		}
		await new Promise(res => setTimeout(res, 100));
	}
})();
