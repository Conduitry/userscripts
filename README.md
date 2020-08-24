# Userscripts

* [e621 thing](https://chor.date/e621.user.js) - A script to make browsing e621.net while not signed in more convenient, and to work around the global blacklist forced on anonymous users.
* [e926 thing](https://chor.date/e926.user.js) - A script to redirect you from e926.net to e621.net.
* [TV Tropes thing](https://chor.date/tvtropes.user.js) - A script to remove the "This is page #x you have viewed this month without ads" banner.
* [YouTube thing](https://chor.date/youtube.user.js) - A script to unset autoplay and display hidden video tags.

## Development

This includes a pre-commit Git hook to automatically update the `@version` tags on the userscripts. To enable it, point Git to use the hooks from the `.githooks` directory.

```
git config core.hookspath .githooks
```

This hook script will prevent the commit if there are any files in the `scripts` directory with both staged and unstaged changes.

## License

[MIT](LICENSE)
