// ==UserScript==
// @name e621 thing
// @namespace https://chor.date
// @description A script to make browsing e621.net while not signed in more convenient, and to work around the global blacklist forced on anonymous users.
// @grant GM.xmlHttpRequest
// @match https://e621.net/*
// @icon https://e621.net/favicon.ico
// ==/UserScript==

// remove guest warning modal
if (document.querySelector('.guest-warning')) {
	document.querySelector('.guest-warning').remove();
} else {
	// either we're logged in or we're on the landing page and we have nothing to do
	return;
}

// disable automatic blacklist
localStorage.setItem('dab', '1');

let match;
if (match = location.pathname.match(/^\/posts\/(\d+)/)) {

	// on page for a single post, fetch and display if blocked by global blacklist
	if (document.querySelector('#image-container:not([data-file-url]):not([data-flags=deleted])')) {
		GM.xmlHttpRequest({
			method: 'GET',
			url: `/posts/${match[1]}.json`,
			onload(resp) {
				const { post } = JSON.parse(resp.responseText);
				if (post.file.ext === 'webm') {
					const el = document.createElement('video');
					el.setAttribute('controls', '');
					el.setAttribute('loop', '');
					el.src = getFileUrl(post);
					document.querySelector('#image-container').appendChild(el);
				} else if (post.file.ext !== 'swf') {
					const el = document.createElement('img');
					el.src = getSampleUrl(post);
					document.querySelector('#image-container').appendChild(el);
				}
				const el = document.createElement('div');
				el.innerHTML = `<a class="button btn-warn" href="${getFileUrl(post)}">Download</a>`;
				document.querySelector('#image-extra-controls').insertBefore(el, document.querySelector('#image-resize-cycle'));
			},
		});
	}

} else if (/^\/posts\/?/.test(location.pathname)) {

	// on search results pages, re-add posts blocked by global blacklist
	const urlSearchParams = new URLSearchParams(location.search);
	GM.xmlHttpRequest({
		method: 'GET',
		url: `/posts.json${makeQuery({ tags: urlSearchParams.get('tags'), page: urlSearchParams.get('page') })}`,
		onload(resp) {
			const { posts } = JSON.parse(resp.responseText);
			const container = document.querySelector('#posts-container');
			let found, next;
			for (let i = posts.length - 1; i >= 0; i--) {
				found = document.querySelector(`#post_${posts[i].id}`);
				if (found) {
					next = found;
				} else {
					const el = document.createElement('article');
					el.setAttribute('class', 'post-preview captioned');
					el.setAttribute('data-file-ext', posts[i].file.ext);
					el.innerHTML = `<a href="/posts/${posts[i].id}${makeQuery({ q: urlSearchParams.get('tags') })}"><img src="${getPreviewUrl(posts[i])}"></a>`;
					container.insertBefore(el, next);
					next = el;
				}
			}
		},
	});

}

// fetch avatars and thumbnails in comments blocked by global blacklist
setInterval(() => {
	for (const img of document.querySelectorAll('.post-thumbnail[data-status=active] img[src^="/images/"]')) {
		img.removeAttribute('src');
		GM.xmlHttpRequest({
			method: 'GET',
			url: `/posts/${img.closest('.post-thumbnail').dataset.id}.json`,
			onload(resp) {
				const { post } = JSON.parse(resp.responseText);
				img.src = getPreviewUrl(post);
			},
		});
	}
}, 1000);

// wrapper around URLSearchParams to simplify creating search queries
function makeQuery(params) {
	const filtered = {};
	for (const key in params) {
		if (params[key] != null) {
			filtered[key] = params[key];
		}
	}
	const str = String(new URLSearchParams(filtered));
	return str && `?${str}`;
}

// from a post's image's MD5, construct the main part of its path
function getPath(md5) {
	return `${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}`;
}

// get the url of the full-sized version of an image
function getFileUrl({ file }) {
	return `https://static1.e621.net/data/${getPath(file.md5)}.${file.ext}`;
}

// get the url of the sample version of an image
function getSampleUrl(post) {
	return post.sample.has ? `https://static1.e621.net/data/sample/${getPath(post.file.md5)}.jpg` : getFileUrl(post);
}

// get the url of the preview version of an image
function getPreviewUrl({ file }) {
	return file.ext === 'swf' ? 'https://static1.e621.net/images/download-preview.png' : `https://static1.e621.net/data/preview/${getPath(file.md5)}.jpg`;
}
