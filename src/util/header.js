(function() {
    "use strict";

    let root = this; // window (browser) or exports (server)
    let sqljsonlib = root.sqljsonlib || {}; // merge with previous or new module
    sqljsonlib["version-{{NAMESUB}}"] = '{{VERSION}}'; // version set through gulp build

    // export module for node or the browser
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = sqljsonlib;
    } else {
      root.sqljsonlib = sqljsonlib;
    }