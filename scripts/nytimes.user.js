// ==UserScript==
// @name New York Times thing
// @namespace https://chor.date
// @description A script to bypass the paywall, mostly.
// @match https://www.nytimes.com/*
// @icon https://www.nytimes.com/favicon.ico
// @version 2023.02.07.122944
// ==/UserScript==

async function wait(selector, cb) {
	for (let i = 0; i < 100; i++) {
		await new Promise(res => setTimeout(res, 100));
		const el = document.querySelector(selector);
		if (el) {
			cb(el);
			break;
		}
	}
}

wait('#app > div > div[class*="-"]', el => el.className = '');
wait('#app > div > div > div[class*="-"]', el => el.className = '');
wait('#gateway-content', el => el.remove());
wait('#standalone-footer > div', el => el.remove());
wait('button[data-testid=GDPR-reject]', el => el.click());
