# Userscripts

Install from files in [`scripts`](scripts) directory.

## Development

This includes a pre-commit Git hook to automatically update the `@version` tags on the userscripts. To enable it, point Git to use the hooks from the `.githooks` directory.

```
git config core.hookspath .githooks
```

This hook script will prevent the commit if there are any files in the [`scripts`](scripts) directory with both staged and unstaged changes.

## License

[MIT](LICENSE)
