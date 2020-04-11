// ==UserScript==
// @name TV Tropes thing
// @namespace https://chor.date
// @description A script to remove the "This is page #x you have viewed this month without ads" banner.
// @match https://tvtropes.org/*
// @icon https://static.tvtropes.org/img/icons/favicon.ico
// ==/UserScript==

const style = document.createElement('style');
style.textContent = 'div[style*="z-index: 100001"] { display: none; }';
document.body.appendChild(style);
