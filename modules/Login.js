var Δ = require('../lib/Delta');

var Login = function (iPool) {
    var self = this,
        responder, session, controller,
        payload,
        iRequest, iResult;

    var _constructor = function () {};

    var isRegistered = function () {
        iPool.getConnection(function (err, connection) {
            var queryStr = Δ.Templator.fitIn('SELECT EmailAddress FROM accounts WHERE EmailAddress="[0]";', [payload.email]);
            connection.query(queryStr, function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        fetchAccount();
                    } else {
                        responder.failure('This email address is not yet registered with us.');
                        iResult.send(controller.publish(responder.get()));
                    }
                } else {
                    responder.failure(err);
                    iResult.send(controller.publish(responder.get()));
                }
                connection.release();
            });
        });
    };

    var fetchAccount = function (isReg) {
        iPool.getConnection(function (err, connection) {
            var queryStr = Δ.Templator.fitIn('SELECT Id, Firstname, Lastname, EmailAddress FROM accounts WHERE EmailAddress="[0]" AND Password="[1]";', [payload.email, payload.password]);
            connection.query(queryStr, function (err, rows) {
                if (!err) {
                    if (rows.length > 0) {
                        var cargo = {
                            userid: rows[0].Id,
                            name: (rows[0].Firstname + ' ' + rows[0].Lastname).trim(),
                            email: rows[0].EmailAddress,
                            authkey: session.create(rows[0].EmailAddress)
                        }
                        responder.success(cargo);
                        iResult.send(controller.publish(responder.get()));
                    } else {
                        responder.failure('The email address or password you entered was wrong.');
                        iResult.send(controller.publish(responder.get()));
                    }
                } else {
                    responder.failure(err);
                    iResult.send(controller.publish(responder.get()));
                }
                connection.release();
            });
        });
    };

    this.initialize = function (req, res) {

        responder = new Δ.Responder();
        session = new Δ.Session();
        controller = new Δ.Controller();

        iRequest = req.params;
        iResult = res;

        payload = controller.process('login', iRequest);
        var o = controller.getPayloadValidated('email, password'.split(', '));
        if (Δ.Utility.isNull(o)) {
            isRegistered();
        } else {
            iResult.send(controller.publish(o));
        }
    };
};

module.exports = Login;