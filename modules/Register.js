var Δ = require('../lib/Delta');

var Register = function (iPool) {
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
                            responder.failure('This email address is already registered with us.');
                            iResult.send(controller.publish(responder.get()));
                        } else {
                            addAccount();
                        }
                    } else {
                        responder.failure(err);
                        iResult.send(controller.publish(responder.get()));
                    }
                    connection.release();
                });
        });
    };

    var addAccount = function (isReg) {
        iPool.getConnection(function (err, connection) {
            var ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
            connection.query('INSERT INTO accounts (Firstname, Lastname, EmailAddress, Username, Password, DateOfBirth, CreatedOn) VALUES (?, ?, ?, ?, ?, ?, ?);', [payload.firstname, payload.lastname, payload.email, payload.email, payload.password, payload.dob, ts],
                function (err, rows) {
                    if (!err) {
                        responder.success('The new account is registered.');
                        iResult.send(controller.publish(responder.get()));
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

        payload = controller.process('login', iRequest);
        var o = controller.getPayloadValidated('firstname, lastname, email, password, dob'.split(', '));
        if (Δ.Utility.isNull(o)) {
            isRegistered();
        } else {
            iResult.send(controller.publish(o));
        }
    };
};

module.exports = Register;