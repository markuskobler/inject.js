NODE   = node
NPM    = npm

BOWER      = ./node_modules/.bin/bower
KARMA	   = ./node_modules/.bin/karma
CLOSURE_DEPS	   = ./build/closure/closure/bin/build/depswriter.py
CLOSURE_BUILDER	   = ./build/closure/closure/bin/build/closurebuilder.py

DATE =$(shell date +%I:%M%p)
DONE =echo "${CHECK} Done"
CHECK=\033[32m✔\033[39m
HR=\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#\#
DR=---------------------------------------------------------------------


test:
	@NODE_ENV=test $(NPM) test

test-coverage:
	@NODE_ENV=test $(NPM) test --coverage


test-kama: build-deps
	@echo 'Karma JS unit testing'
	$(KARMA) start config/karma.conf.js
	@$(DONE)


build-deps:
	@echo -n '- Build js deps .......................... '
	@mkdir -p ./build/injector/
	@$(CLOSURE_DEPS) --root_with_prefix="lib/injector/ ../injector/" --root_with_prefix="test/client/ ../client/" > ./build/injector/deps.js
	@$(DONE)


build:
	@echo -n '- Build js'
	$(KARMA) start config/karma.conf.js
	@$(DONE)


clean:
	@echo -n 'Cleaning...                                                  '
	@rm -rf build
	@rm -rf node_modules
	@echo "${CHECK} Done"


.PHONY: build-deps build clean test test-coverage test-kama
