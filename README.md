# Userscripts

[e621 thing](scripts/e621.user.js) | [e926 thing](scripts/e926.user.js) | [TV Tropes thing](scripts/tvtropes.user.js) | [YouTube thing](scripts/youtube.user.js)

## Development

This includes a pre-commit Git hook to automatically update the `@version` tags on the userscripts. To enable it, point Git to use the hooks from the `.githooks` directory.

```
git config core.hookspath .githooks
```

This hook script will prevent the commit if there are any files in the `scripts` directory with both staged and unstaged changes.

## License

[MIT](LICENSE)
