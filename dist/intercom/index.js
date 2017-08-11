'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _customerUserRegister = require('./customerUserRegister');

var _customerUserRegister2 = _interopRequireDefault(_customerUserRegister);

var _customerUserAutomaticRegister = require('./customerUserAutomaticRegister');

var _customerUserAutomaticRegister2 = _interopRequireDefault(_customerUserAutomaticRegister);

var _orderCompletePayment = require('./orderCompletePayment');

var _orderCompletePayment2 = _interopRequireDefault(_orderCompletePayment);

var _orderUpdateOrderStatus = require('./orderUpdateOrderStatus');

var _orderUpdateOrderStatus2 = _interopRequireDefault(_orderUpdateOrderStatus);

var _orderDeletePendingOrder = require('./orderDeletePendingOrder');

var _orderDeletePendingOrder2 = _interopRequireDefault(_orderDeletePendingOrder);

var _orderCreateOrder = require('./orderCreateOrder');

var _orderCreateOrder2 = _interopRequireDefault(_orderCreateOrder);

var _customerSyncGuestOrders = require('./customerSyncGuestOrders');

var _customerSyncGuestOrders2 = _interopRequireDefault(_customerSyncGuestOrders);

var _customerUpdateCustomerInfo = require('./customerUpdateCustomerInfo');

var _customerUpdateCustomerInfo2 = _interopRequireDefault(_customerUpdateCustomerInfo);

var _orderBackendUpdateOrderStatus = require('./orderBackendUpdateOrderStatus');

var _orderBackendUpdateOrderStatus2 = _interopRequireDefault(_orderBackendUpdateOrderStatus);

var _customerAddCollection = require('./customerAddCollection');

var _customerAddCollection2 = _interopRequireDefault(_customerAddCollection);

var _customerRemoveCollection = require('./customerRemoveCollection');

var _customerRemoveCollection2 = _interopRequireDefault(_customerRemoveCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _bunyan2.default.createLogger({ name: 'intercom' });

const addListenerIntercom = conn => {
  conn.then(result => {
    result.createChannel().then(ch => {
      (0, _customerUserRegister2.default)(ch);
      (0, _customerUserAutomaticRegister2.default)(ch);
      (0, _orderCompletePayment2.default)(ch);
      (0, _orderUpdateOrderStatus2.default)(ch);
      (0, _orderDeletePendingOrder2.default)(ch);
      (0, _orderCreateOrder2.default)(ch);
      (0, _customerSyncGuestOrders2.default)(ch);
      (0, _customerUpdateCustomerInfo2.default)(ch);
      (0, _orderBackendUpdateOrderStatus2.default)(ch);
      (0, _customerAddCollection2.default)(ch);
      (0, _customerRemoveCollection2.default)(ch);
    }).catch(e => {
      log.info(e);
    });
  }).catch(e => {
    log.info(e);
  });
};

exports.default = addListenerIntercom;