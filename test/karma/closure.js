(function (window) {
    "use strict";

    var karma = window.__karma__,
        doc = window.document;

    function pathName(url) {
        var basePath = goog.basePath.substring(21);
        if (karma.files.hasOwnProperty(basePath + url)) {
            url = url + '?' + karma.files[basePath + url];
        } else {
            console.log('There is no timestamp for ' + basePath + url + '!');
        }
        return url;
    }

    function importScript(src) {
        if (typeof doc !== 'undefined' && 'write' in doc) {

            // If the user tries to require a new symbol after document load,
            // something has gone terribly wrong. Doing a document.write would
            // wipe out the page.
            if (doc.readyState === 'complete') {
                // Certain test frameworks load base.js multiple times, which tries
                // to write deps.js each time. If that happens, just fail silently.
                // These frameworks wipe the page between each load of base.js, so this
                // is OK.
                var isDeps = /\bdeps\.js$/.test(src);
                if (isDeps) {
                    return false;
                } else {
                    throw new Error('Cannot write "' + src + '" after document load');
                }
            }

            doc.write('<script type="text/javascript" src="' + pathName(src) + '"></' + 'script>');
            return true;
        } else {
            return false;
        }
    }

    window.CLOSURE_NO_DEPS = true;
//    window.CLOSURE_IMPORT_SCRIPT = importScript;

})(window || this);