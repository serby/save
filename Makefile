test:
	@./node_modules/.bin/mocha -r should -R spec

lint-changed:
	@jshint `git status --porcelain | sed -e "s/^...//g"`

lint:
	@jshint lib test

.PHONY: test lint lint-changed