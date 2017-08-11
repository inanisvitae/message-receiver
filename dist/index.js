'use strict';

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _amqplib = require('amqplib');

var _amqplib2 = _interopRequireDefault(_amqplib);

var _intercom = require('./intercom');

var _intercom2 = _interopRequireDefault(_intercom);

var _mixpanel = require('./mixpanel');

var _mixpanel2 = _interopRequireDefault(_mixpanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const log = _bunyan2.default.createLogger({ name: 'message_receiver' });

const establishConn = (() => {
  var _ref = _asyncToGenerator(function* () {
    try {
      return yield _amqplib2.default.connect(_config2.default.get('messageQueue.host'));
    } catch (e) {
      log.info('Failed to establish connection');
      return null;
    }
  });

  return function establishConn() {
    return _ref.apply(this, arguments);
  };
})();

const conn = establishConn();

(0, _intercom2.default)(conn);
(0, _mixpanel2.default)(conn);