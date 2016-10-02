var Base64 = require('./Base64');
    
var Δ = {
    Singleton: function (Class) {
        var instance;
        return {
            getInstance: function () {
                if (!instance) {
                    instance = new Class();
                }
                return instance;
            }
        };
    },

    Tracer: function () {
        var list = [];
        this.log = function (s) {
            list.push(s);
        };
        this.view = function () {
            return list;
        }
    },

    Responder: function () {
        var o = {
            status: null,
            response: null
        };
        this.set = function (status, response) {
            o.status = status;
            o.response = response;
        };
        this.get = function () {
            return o;
        };
        this.success = function (response) {
            this.set(true, response);
        };
        this.failure = function (response) {
            this.set(false, response);
        };
    },

    Utility: {
        indexOfObj: function (item, obj) {
            for (var o in obj) {
                if (obj[o] == item) {
                    return o;
                }
            }
        },
        isNull: function (data) {
            return (data == null) ? true : false;
        },
        isEmpty: function (obj) {
            // null and undefined are "empty"
            if (obj == null) return true;
            // Assume if it has a length property with a non-zero value that that property is correct.
            if (obj.length > 0) return false;
            if (obj.length === 0) return true;
            // Otherwise, does it have any properties of its own? Note that this doesn't handle toString and valueOf enumeration bugs in IE < 9
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key))
                    return false;
            }
            return true;
        }
    },

    Templator: {
        fitIn: function (template, arglist) {
            var tag, output = template;
            for (var i = 0, len = arglist.length; i < len; i++) {
                tag = new RegExp("\\[" + i + "\\]", 'g')
                output = output.replace(tag, arglist[i]);
            }
            return output;
        },
        fixIn: function (template, hashtable) {
            var tag, output = template;
            for (var key in hashtable) {
                tag = new RegExp("\\[" + key + "\\]", 'g')
                output = output.replace(tag, hashtable[key]);
            }
            return output;
        },
        castAs: function (template, list, cast) {
            var t, k, o = template;
            for (var i = 0; i < list.length; i++) {
                k = list[i];
                t = new RegExp("\\[" + k + "\\]", 'g')
                o = o.replace(t, this.fitIn(cast, [k]));
            }
            return o;
        }
    },

    Payloader: function () {
        var responder;
        var _constructor = function () {
            responder = new Δ.Responder();
        }();
        this.defined = function (pkg) {
            if (pkg == null) {
                responder.failure("Payload is missing.");
                return responder.get();
            }
            return null;
        };
        this.verify = function (pkg, attr) {
            for (var i = 0, len = attr.length; i < len; i++) {
                if (!pkg.hasOwnProperty(attr[i])) {
                    responder.failure(Δ.Templator.fitIn("'[0]' is missing in payload.", [attr[i]]));
                    return responder.get();
                }
            }
            return null;
        };
    },

    Session: function () {
        var responder,
            duration = 60 * 60 * 1000;
        var _constructor = function () {
            responder = new Δ.Responder();
        }();
        this.create = function (email) {
            var timestamp = new Date().getTime().toString();
            return Base64.encode(JSON.stringify([email, timestamp]));
        };
        this.extract = function (authkey) {
            var decoded = Base64.decode(authkey);
            return JSON.parse(decoded);
        };
        this.valid = function (authkey) {
            if (!Δ.Utility.isEmpty(authkey)) {
                var now = new Date().getTime();
                var key = this.extract(authkey);
                var session = parseInt(key[1]) + duration;
                if (session < now) {
                    responder.failure("Session expired!");
                    return responder.get();
                }
            } else {
                responder.failure("Invalid session!");
                return responder.get();
            }
            return null;
        };
    },

    Controller: function () {
        var self = this,
            callback, command, payload, authkey,
            payloader, session, responder;

        var _constructor = function () {
            payloader = new Δ.Payloader();
            session = new Δ.Session();
            responder = new Δ.Responder();
        }();

        var getPackagedResponse = function (stuff) {
            var resp;
            if (!Δ.Utility.isNull(callback)) {
                resp = callback + '(' + stuff + ')';
            } else {
                resp = stuff;
            }
            return resp;
        };

        this.getPayloadValidated = function (traits) {
            var output = payloader.defined(payload);
            if (Δ.Utility.isNull(output)) {
                output = payloader.verify(payload, traits);
                if (Δ.Utility.isNull(output)) {
                    return null;
                }
            }
            return output;
        };

        this.getSessionAndPayloadValidated = function (traits) {
            var output = session.valid(authkey);
            if (Δ.Utility.isNull(output)) {
                output = (!!traits) ? getPayloadValidated(traits) : output;
            }
            return output;
        };

        this.publish = function (o) {
            var material = JSON.stringify({
                command: (command != undefined) ? command : 'undefined',
                status: (o.status) ? 'success' : 'failure',
                response: o.response
            });
            return getPackagedResponse(material);
        };

        this.process = function (cmd, req) {
            command = cmd;
            payload = (!!req.pl) ? JSON.parse(req.pl) : null;
            callback = (!!req && !!req.cb) ? req.cb : null;
            authkey = (!!req && !!req.ak) ? req.ak : null;
            return payload;
        };
    }
};

module.exports = Δ;