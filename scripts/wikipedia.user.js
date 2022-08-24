// ==UserScript==
// @name Wikipedia thing
// @namespace https://chor.date
// @description A script to remove the fundraising banner.
// @match https://*.wikipedia.org/*
// @icon https://en.wikipedia.org/static/favicon/wikipedia.ico
// @version 2022.08.24.113914
// ==/UserScript==

const style = document.createElement('style');
style.textContent = '#frb-main { display: none !important; }';
document.body.appendChild(style);
