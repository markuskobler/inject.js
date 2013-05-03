NODE   = node
NPM    = npm

BOWER      = ./node_modules/.bin/bower
KARMA	   = ./node_modules/.bin/karma
MOCHA      = ./node_modules/mocha/bin/_mocha
MOCHA_OPTS =
CLOSURE_COMPILER   = ./bin/closure/compiler.jar
CLOSURE_DEPS	   = ./bin/closure/build/depswriter.py
CLOSURE_BUILDER	   = ./bin/closure/build/closurebuilder.py
REPORTER   = dot

DATE =$(shell date +%I:%M%p)
DONE =echo "${CHECK} Done"
CHECK=\033[32m✔\033[39m
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
DR=---------------------------------------------------------------------

test:
	@NODE_ENV=test $(NPM) test

test-coverage:
	@NODE_ENV=test $(NPM) test --coverage

test-kama:
	@echo 'Karma JS unit testing'
	$(KARMA) start config/karma.conf.js
	@$(DONE)

clean:
	@echo -n 'Cleaning...                                                  '
	@rm -rf build
	@rm -rf node_modules
	@echo "${CHECK} Done"

.PHONY: build clean test test-coverage
