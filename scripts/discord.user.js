// ==UserScript==
// @name Discord thing
// @namespace https://chor.date
// @description A script to remove role icons and server boost icons.
// @match https://discord.com/*
// @icon https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico
// @version 2021.12.13.173452
// ==/UserScript==

const style = document.createElement('style');
style.textContent = '[class*=roleIcon], [class*=premiumIcon] { display:none; }';
document.head.appendChild(style);
