var Δ = require('../lib/Delta');

var Forgot = function (iPool) {
    var self = this,
        responder, session, controller,
        payload,
        iRequest, iResult;

    var _constructor = function () {};

    var isRegistered = function () {
        iPool.getConnection(function (err, connection) {
            connection.query('SELECT EmailAddress FROM accounts WHERE EmailAddress=?', [payload.email],
                function (err, rows) {
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
            connection.query('SELECT Firstname, Lastname, EmailAddress, Password FROM accounts WHERE EmailAddress=? AND DateOfBirth=?', [payload.email, payload.dob],
                function (err, rows) {
                    if (!err) {
                        if (rows.length > 0) {
                            var cargo = {
                                name: (rows[0].Firstname + ' ' + rows[0].Lastname).trim(),
                                email: rows[0].EmailAddress,
                                password: rows[0].Password
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

        iRequest = req.body;
        iResult = res;

        payload = controller.process('forgot', iRequest);
        var o = controller.getPayloadValidated('email, dob'.split(', '));
        if (Δ.Utility.isNull(o)) {
            isRegistered();
        } else {
            iResult.send(controller.publish(o));
        }
    };
};

module.exports = Forgot;