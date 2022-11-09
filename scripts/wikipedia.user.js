// ==UserScript==
// @name Wikipedia thing
// @namespace https://chor.date
// @description A script to remove the fundraising banner.
// @match https://*.wikipedia.org/*
// @icon https://en.wikipedia.org/static/favicon/wikipedia.ico
// @version 2022.11.09.154900
// ==/UserScript==

const style = document.createElement('style');
style.textContent = '#frb-main, #frb-inline { display: none !important; }';
document.body.appendChild(style);
