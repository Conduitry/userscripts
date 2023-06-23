// ==UserScript==
// @name Discord thing
// @namespace https://chor.date
// @description A script to remove role icons, server boost icons, and super reaction buttons.
// @match https://discord.com/*
// @icon https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico
// @version 2023.06.23.153650
// ==/UserScript==

const style = document.createElement('style');
style.textContent = '[class*=roleIcon], [class*=premiumIcon], [aria-label="Add Super Reaction"] { display:none; }';
document.head.appendChild(style);
