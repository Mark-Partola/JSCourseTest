System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Helper;
    return {
        setters: [],
        execute: function () {
            Helper = (function () {
                function Helper() {
                }
                Helper.print = function (state) {
                    var out = state.toString(2);
                    this.write(("0000" + out).slice(out.length));
                };
                Helper.write = function (text) {
                    document.body.innerHTML += "<p>" + JSON.stringify(text) + "</p>";
                };
                return Helper;
            }());
            exports_1("default", Helper);
        }
    };
});
//# sourceMappingURL=Helper.js.map