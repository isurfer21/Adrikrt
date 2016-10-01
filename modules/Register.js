var Δ = require('../lib/Delta');

var Register = function (iPool) {
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
            var queryStr = Δ.Templator.fitIn('INSERT INTO accounts (Firstname, Lastname, EmailAddress, Password, DateOfBirth) VALUES ("[0]", "[1]", "[2]", "[3]", "[4]");', [payload.firstname, payload.lastname, payload.email, payload.password, payload.dob]);
            connection.query(queryStr, function (err, rows) {
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

module.exports = Register;