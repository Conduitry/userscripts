// ==UserScript==
// @name e926 thing
// @namespace https://chor.date
// @description A script to redirect you from e926.net to e621.net.
// @match https://e926.net/*
// @icon https://e926.net/favicon.ico
// @version 0
// ==/UserScript==

// redirect to same URL on e621.net
location.href = `https://e621.net${location.href.slice(location.origin.length)}`;
