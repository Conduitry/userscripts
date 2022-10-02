// ==UserScript==
// @name AccuWeather thing
// @namespace https://chor.date
// @description Preserve selected day when navigating between daily and hourly weather forecast pages.
// @match https://www.accuweather.com/*
// @icon https://www.accuweather.com/favicon.ico
// @version 2022.10.02.124623
// ==/UserScript==

if (location.search) {
	document.querySelectorAll('a[href*="/daily-weather-forecast/"]:not([href*="?"]), a[href*="/hourly-weather-forecast/"]:not([href*="?"])').forEach(el => el.href += location.search);
}
