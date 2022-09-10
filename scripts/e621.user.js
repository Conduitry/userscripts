// ==UserScript==
// @name e621 thing
// @namespace https://chor.date
// @description A script to make browsing e621.net while not signed in more convenient, and to work around the global blacklist forced on anonymous users.
// @match https://e621.net/*
// @icon https://e621.net/favicon.ico
// @version 2022.09.10.020055
// ==/UserScript==

// wrapper around URLSearchParams to simplify creating search queries
const make_query = (params) => {
	const filtered = {};
	for (const key in params) {
		if (params[key] != null) {
			filtered[key] = params[key];
		}
	}
	const str = String(new URLSearchParams(filtered));
	return str && `?${str}`;
};

// make request and return parsed JSON
let last_request_time = 0;
const make_request = (path, params) => new Promise(res => setTimeout(() => {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => xhr.readyState === 4 && xhr.status === 200 && res(JSON.parse(xhr.responseText));
	xhr.open('GET', path + make_query(params), true);
	xhr.send();
	last_request_time = Date.now();
}, Math.max(last_request_time + 500 - Date.now(), 0)));

// find all posts matching tags, iterating through pages (only works with the default ordering of decreasing ids)
const find_all_posts = async tags => {
	const all_posts = [];
	for (let page = null; ;) {
		const { posts } = await make_request('/posts.json', { limit: 320, tags, page });
		all_posts.push(...posts);
		if (posts.length < 320) {
			return all_posts;
		}
		page = `b${posts[319].id}`;
	}
};

// from a post's image's MD5, construct the main part of its path
const get_path = md5 => `${md5.slice(0, 2)}/${md5.slice(2, 4)}/${md5}`;

// get the url of the full-sized version of an image
const get_file_url = ({ file }) => `https://static1.e621.net/data/${get_path(file.md5)}.${file.ext}`;

// get the url of the sample version of an image
const get_sample_url = post => post.sample.has ? `https://static1.e621.net/data/sample/${get_path(post.file.md5)}.jpg` : get_file_url(post);

// get the url of the preview version of an image
const get_preview_url = post => post.flags.deleted ? 'https://e621.net/images/deleted-preview.png' : post.file.ext === 'swf' ? 'https://static1.e621.net/images/download-preview.png' : `https://static1.e621.net/data/preview/${get_path(post.file.md5)}.jpg`;

// recursively build a DOM tree
const dom = data => {
	if (typeof data === 'string') {
		return document.createTextNode(data);
	}
	const el = document.createElement(data[0]);
	for (const key in data[1]) {
		if (data[1][key] != null) {
			el.setAttribute(key, data[1][key]);
		}
	}
	for (let i = 2; i < data.length; i++) {
		el.appendChild(dom(data[i]));
	}
	return el;
};

// tagged template function to suppress falsy expressions
const t = (strings, ...values) => String.raw({ raw: strings }, ...values.map(value => value || ''));

// augment results list with given posts
const augment_results = (container, posts, link_params) => {
	let found, next;
	for (let i = posts.length - 1; i >= 0; i--) {
		found = container.querySelector(`#post_${posts[i].id}`);
		if (found) {
			next = found;
		} else {
			const post = posts[i];
			const el = dom(['article', { class: t`post-preview captioned ${post.relationships.parent_id && 'post-status-has-parent'} ${post.relationships.has_active_children && 'post-status-has-children'} ${post.flags.pending && 'post-status-pending'} ${post.flags.flagged && 'post-status-flagged'} post-rating-${{ s: 'safe', q: 'questionable', e: 'explicit' }[post.rating]}`, 'data-tags': post.tags.meta.includes('animated') ? 'animated' : null, 'data-file-ext': post.file.ext }, ['a', { href: `/posts/${post.id}${make_query(link_params)}` }, ['img', { src: get_preview_url(post), title: `Rating: ${post.rating}\nID: ${post.id}\nStatus: ${post.flags.deleted ? 'deleted' : post.flags.flagged ? 'flagged' : post.flags.pending ? 'pending' : 'active'}\nDate: ${post.created_at}\n\n${[...new Set(Object.values(post.tags).flat())].sort().join(' ')}` }]], ['div', { class: 'desc' }, ['div', { class: 'post-score' }, ['span', { class: `post-score-score score-${post.score.total > 0 ? 'positive' : post.score.total < 0 ? 'negative' : 'neutral'}` }, `${post.score.total > 0 ? '↑' : post.score.total < 0 ? '↓' : '↕'}${post.score.total}`], ['span', { class: 'post-score-faves' }, `♥${post.fav_count}`], ['span', { class: 'post-score-comments' }, `C${post.comment_count}`], ['span', { class: 'post-score-rating' }, post.rating.toUpperCase()], ['span', { class: 'post-score-extras' }, t`${post.relationships.parent_id && 'P'}${post.relationships.has_active_children && 'C'}${post.flags.pending && 'U'}${post.flags.flagged && 'F'}`]]]]);
			container.insertBefore(el, next);
			next = el;
		}
	}
};

(async () => {

	if (!document.querySelector('.guest-warning')) {
		// either we're logged in or we're on the landing page and we have nothing to do
		return;
	}

	// remove guest warning modal
	document.querySelector('.guest-warning').remove();

	// disable automatic blacklist
	localStorage.setItem('dab', '1');

	const query = Object.fromEntries(new URLSearchParams(location.search));
	let match;

	if (match = location.pathname.match(/^\/posts\/(?<post_id>\d+)/)) {

		// on pages for a single post ...
		const { post_id } = match.groups;
		let post;
		const get_post = async () => post || (post = (await make_request(`/posts/${post_id}.json`)).post);
		// ... fetch and display if blocked by global blacklist
		if (document.querySelector('#image-container:not([data-file-url]):not([data-flags=deleted])')) {
			if ((await get_post()).file.ext === 'webm') {
				document.querySelector('#image-container').appendChild(dom(['video', { controls: '', loop: '', src: get_file_url(post) }]));
			} else if (post.file.ext !== 'swf') {
				document.querySelector('#image-container').appendChild(dom(['img', { src: get_sample_url(post) }]));
			}
			document.querySelector('#image-extra-controls').insertBefore(dom(['div', {}, ['a', { class: 'button btn-warn', href: get_file_url(post) }, 'Download']]), document.querySelector('#image-resize-cycle'));
		}
		// ... display children
		if (document.querySelector('#has-children-relationship-preview')) {
			const all_posts = (await find_all_posts(`parent:${post_id}`)).reverse();
			augment_results(document.querySelector('#has-children-relationship-preview'), all_posts, { q: `parent:${post_id}` });
		}
		// ... display parent
		if (document.querySelector('#has-parent-relationship-preview') && !document.querySelector('#has-parent-relationship-preview article')) {
			const all_posts = await find_all_posts(`id:${(await get_post()).relationships.parent_id}`);
			augment_results(document.querySelector('#has-parent-relationship-preview'), all_posts, { q: `parent:${post.relationships.parent_id}` });
		}

	} else if (/^\/posts\/?/.test(location.pathname)) {

		// on search results pages, re-add posts blocked by global blacklist
		if (document.querySelector('.hidden-posts-notice')) {
			const { posts } = await make_request('/posts.json', { tags: query.tags, page: query.page });
			augment_results(document.querySelector('#posts-container'), posts, { q: query.tags });
		}

	} else if (match = location.pathname.match(/^\/pools\/(?<pool_id>\d+)/)) {

		// on pool view pages, re-add posts blocked by global blacklist
		const { pool_id } = match.groups;
		const { post_ids } = await make_request(`/pools/${pool_id}.json`);
		const all_blocked_posts = await find_all_posts(`pool:${pool_id} young -rating:s`);
		const page = +query.page || 1;
		const posts = post_ids.slice((page - 1) * 75, page * 75).map(post_id => all_blocked_posts.find(({ id }) => id === post_id) || { id: post_id });
		augment_results(document.querySelector('#posts-container'), posts, { pool_id });

	} else if (/^\/popular\/?/.test(location.pathname)) {

		// on popular posts pages, re-add posts blocked by global blacklist
		const { posts } = await make_request('/popular.json', { date: query.date, scale: query.scale });
		augment_results(document.querySelector('#posts-container'), posts);

	} else if (/^\/wiki_pages\/(\d+|show_or_new)/.test(location.pathname)) {

		// on wiki pages, re-add most recent 4 posts blocked by global blacklist
		if (document.querySelectorAll('#wiki-page-posts article').length < 4) {
			const tag = new URLSearchParams(new URL(document.querySelector('#wiki-page-posts a')).search).get('tags');
			const { posts } = await make_request('/posts.json', { tags: tag, limit: 4 });
			augment_results(document.querySelector('#wiki-page-posts'), posts, { q: tag });
		}

	} else if (/^\/users\/\d+/.test(location.pathname)) {

		// on user pages, re-add most recent 6 posts blocked by global blacklist
		if (document.querySelectorAll('.user-uploads .vertical-section article').length < 6) {
			const tag = new URLSearchParams(new URL(document.querySelector('.user-uploads a')).search).get('tags');
			const { posts } = await make_request('/posts.json', { tags: tag, limit: 6 });
			augment_results(document.querySelector('.user-uploads .vertical-section'), posts, { q: tag });
		}

	}

	// fetch avatars and thumbnails in comments and wiki articles blocked by global blacklist
	while (document.querySelector('#comments .post-thumb.placeholder:not([data-id="0"]), #comments .dtext-post-id-link, #wiki-page-body .dtext-post-id-link')) {
		await new Promise(res => setTimeout(res, 100));
	}
	for (const el of document.querySelectorAll('.post-thumbnail[data-id]:not([data-flags=deleted]):not([data-md5]) img')) {
		el.src = get_preview_url((await make_request(`/posts/${el.closest('[data-id]').dataset.id}.json`)).post);
	}

	// fetch more missing previews
	for (const el of document.querySelectorAll('[data-id]:not([data-flags=deleted]):not([data-md5]) .preview')) {
		const id = el.closest('[data-id]').dataset.id;
		el.appendChild(dom(['a', { href: `/posts/${id}` }, ['img', { src: get_preview_url((await make_request(`/posts/${id}.json`)).post) }]]));
	}

})();
