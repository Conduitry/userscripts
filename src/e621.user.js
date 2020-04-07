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

	const url_search_params = new URLSearchParams(location.search);
	let match;

	if (match = location.pathname.match(/^\/posts\/(\d+)/)) {

		// on pages for a single post ...
		let post;
		const get_post = async () => post || (post = (await make_request(`/posts/${match[1]}.json`)).post);
		// ... fetch and display if blocked by global blacklist
		if (document.querySelector('#image-container:not([data-file-url]):not([data-flags=deleted])')) {
			if ((await get_post()).file.ext === 'webm') {
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
		// ... display children
		if (document.querySelector('#has-children-relationship-preview')) {
			const all_posts = await find_all_posts(`parent:${match[1]}`);
			augment_results(document.querySelector('#has-children-relationship-preview'), all_posts, { q: `parent:${match[1]}` });
		}
		// ... display parent
		if (document.querySelector('#has-parent-relationship-preview') && !document.querySelector('#has-parent-relationship-preview article')) {
			const all_posts = await find_all_posts(`id:${(await get_post()).relationships.parent_id}`);
			augment_results(document.querySelector('#has-parent-relationship-preview'), all_posts, { q: `parent:${post.relationships.parent_id}` });
		}

	} else if (/^\/posts\/?/.test(location.pathname)) {

		// on search results pages, re-add posts blocked by global blacklist
		const { posts } = await make_request('/posts.json', { tags: url_search_params.get('tags'), page: url_search_params.get('page') });
		augment_results(document.querySelector('#posts-container'), posts, { q: url_search_params.get('tags') });

	} else if (match = location.pathname.match(/^\/pools\/(\d+)/)) {

		// on pool view pages, re-add posts blocked by global blacklist
		const { post_ids } = await make_request(`/pools/${match[1]}.json`);
		const all_posts = await find_all_posts(`pool:${match[1]}`);
		const page = +url_search_params.get('page') || 1;
		const posts = post_ids.slice((page - 1) * 75, page * 75).map(post_id => all_posts.find(({ id }) => id === post_id));
		augment_results(document.querySelector('#posts-container'), posts, { pool_id: match[1] });

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

// find all posts matching tags, iterating through pages
async function find_all_posts(tags) {
	const all_posts = [];
	for (let page = 1; ; page++) {
		const { posts } = await make_request('/posts.json', { tags, page });
		all_posts.push(...posts);
		if (posts.length < 75) {
			return all_posts.reverse();
		}
	}
}

// augment results list with given posts
function augment_results(container, posts, link_params) {
	let found, next;
	for (let i = posts.length - 1; i >= 0; i--) {
		found = container.querySelector(`#post_${posts[i].id}`);
		if (found) {
			next = found;
		} else {
			const post = posts[i];
			const el = document.createElement('article');
			el.classList.add('post-preview');
			el.classList.add('captioned');
			el.classList.toggle('post-status-has-parent', post.relationships.parent_id);
			el.classList.toggle('post-status-has-children', post.relationships.has_active_children);
			el.classList.toggle('post-status-pending', post.flags.pending);
			el.classList.toggle('post-status-flagged', post.flags.flagged);
			el.classList.toggle('post-rating-safe', post.rating === 's');
			el.classList.toggle('post-rating-questionable', post.rating === 'q');
			el.classList.toggle('post-rating-explicit', post.rating === 'e');
			if (post.tags.general.includes('animated')) {
				el.setAttribute('data-tags', 'animated');
			}
			el.setAttribute('data-file-ext', post.file.ext);
			el.innerHTML = `<a href="/posts/${post.id}${make_query(link_params)}"><img src="${get_preview_url(post)}"></a><div class="desc"><div class="post-score"><span class="post-score-score ${post.score.total > 0 ? 'score-positive' : post.score.total < 0 ? 'score-negative' : 'score-neutral'}">${post.score.total > 0 ? '↑' : post.score.total < 0 ? '↓' : '↕'}${post.score.total}</span><span class="post-score-faves">♥${post.fav_count}</span><span class="post-score-comments">C${post.comment_count}</span><span class="post-score-rating">${post.rating.toUpperCase()}</span><span class="post-score-extras">${post.relationships.parent_id ? 'P' : ''}${post.relationships.has_active_children ? 'C' : ''}${post.flags.pending ? 'U' : ''}${post.flags.flagged ? 'F' : ''}</span></div></div>`;
			container.insertBefore(el, next);
			next = el;
		}
	}
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
