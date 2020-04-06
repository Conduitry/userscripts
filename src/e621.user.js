// ==UserScript==
// @name e621 thing
// @namespace https://chor.date
// @description A script to make browsing e621.net while not signed in more convenient, and to work around the global blacklist forced on anonymous users.
// @match https://e621.net/*
// @icon https://e621.net/favicon.ico
// ==/UserScript==

(async () => {

	if (!document.querySelector('.guest-warning')) {
		// either we're logged in or we're on the landing page and we have nothing to do
		return;
	}

	// remove guest warning modal
	document.querySelector('.guest-warning').remove();

	// disable automatic blacklist
	localStorage.setItem('dab', '1');

	let match;
	if (match = location.pathname.match(/^\/posts\/(\d+)/)) {

		// on page for a single post, fetch and display if blocked by global blacklist
		if (document.querySelector('#image-container:not([data-file-url]):not([data-flags=deleted])')) {
			const { post } = await make_request(`/posts/${match[1]}.json`);
			if (post.file.ext === 'webm') {
				const el = document.createElement('video');
				el.setAttribute('controls', '');
				el.setAttribute('loop', '');
				el.src = get_file_url(post);
				document.querySelector('#image-container').appendChild(el);
			} else if (post.file.ext !== 'swf') {
				const el = document.createElement('img');
				el.src = get_sample_url(post);
				document.querySelector('#image-container').appendChild(el);
			}
			const el = document.createElement('div');
			el.innerHTML = `<a class="button btn-warn" href="${get_file_url(post)}">Download</a>`;
			document.querySelector('#image-extra-controls').insertBefore(el, document.querySelector('#image-resize-cycle'));
		}

	} else if (/^\/posts\/?/.test(location.pathname)) {

		// on search results pages, re-add posts blocked by global blacklist
		const url_search_params = new URLSearchParams(location.search);
		const { posts } = await make_request('/posts.json', { tags: url_search_params.get('tags'), page: url_search_params.get('page') });
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
				el.innerHTML = `<a href="/posts/${posts[i].id}${make_query({ q: url_search_params.get('tags') })}"><img src="${get_preview_url(posts[i])}"></a>`;
				container.insertBefore(el, next);
				next = el;
			}
		}

	}

	// fetch avatars and thumbnails in comments blocked by global blacklist
	setInterval(() => {
		for (const img of document.querySelectorAll('.post-thumbnail[data-status=active] img[src^="/images/"]')) {
			img.removeAttribute('src');
			make_request(`/posts/${img.closest('.post-thumbnail').dataset.id}.json`).then(({ post }) => img.src = get_preview_url(post));
		}
	}, 1000);

})();

// wrapper around URLSearchParams to simplify creating search queries
function make_query(params) {
	const filtered = {};
	for (const key in params) {
		if (params[key] != null) {
			filtered[key] = params[key];
		}
	}
	const str = String(new URLSearchParams(filtered));
	return str && `?${str}`;
}

// make request and return parsed JSON
function make_request(path, params) {
	return new Promise(res => {
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => xhr.readyState === 4 && xhr.status === 200 && res(JSON.parse(xhr.responseText));
		xhr.open('GET', path + make_query(params), true);
		xhr.send();
	});
}

// from a post's image's MD5, construct the main part of its path
function get_path(md5) {
	return `${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}`;
}

// get the url of the full-sized version of an image
function get_file_url({ file }) {
	return `https://static1.e621.net/data/${get_path(file.md5)}.${file.ext}`;
}

// get the url of the sample version of an image
function get_sample_url(post) {
	return post.sample.has ? `https://static1.e621.net/data/sample/${get_path(post.file.md5)}.jpg` : get_file_url(post);
}

// get the url of the preview version of an image
function get_preview_url({ file }) {
	return file.ext === 'swf' ? 'https://static1.e621.net/images/download-preview.png' : `https://static1.e621.net/data/preview/${get_path(file.md5)}.jpg`;
}
