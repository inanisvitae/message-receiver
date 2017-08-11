'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _intercomClient = require('intercom-client');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _publicConst = require('./publicConst');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _bunyan2.default.createLogger({ name: 'orderUpdateOrderStatus' });
const client = new _intercomClient.Client(_config2.default.get('thirdPartyPlatform.intercom'));
const connPool = new _pg2.default.Pool(_config2.default.get('database.pg'));

const updateOrderStatus = ch => {
  // ORDER:UPDATE_ORDER_STATUS to update the status of the order * debugged
  ch.assertQueue('ORDER:UPDATE_ORDER_STATUS', { durable: true });
  ch.consume('ORDER:UPDATE_ORDER_STATUS', msg => {
    const contentObject = JSON.parse(msg.content);
    const customerId = contentObject.customer_id;
    const queryWithCustomerId = `SELECT customer_id, guest_id, status, promoter_id, payment, id, deleted_at FROM public.order WHERE customer_id = ${customerId};`;
    if (customerId) {
      connPool.query(queryWithCustomerId, [], (err, result) => {
        if (err) {
          log.info('Error connecting to pg');
        } else {
          let totalPayment = 0;
          const statusMap = new Map();
          let numOrders = 0;
          const change = {};
          if (result.rows.length > 0) {
            result.rows.forEach(element => {
              totalPayment += Number.parseInt(element.payment, 10);
              // Should also check whether a pending order has been deleted or not
              let currentStatus = `status_num_${element.status}`;
              // To check the status to see whether it's a deleted pending order
              if (element.status === 'pending') {
                if (element.deleted_at) {
                  currentStatus += '_deleted';
                }
              }
              if (_publicConst.completedOrdersSignature.indexOf(element.status) !== -1) {
                numOrders += 1;
              }
              if (statusMap.has(currentStatus)) {
                statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
              } else {
                statusMap.set(currentStatus, 1);
              }
            });
            [...statusMap].forEach(element2 => {
              change[element2[0]] = element2[1];
            });
            change.num_orders = numOrders;
            change.total_payment = totalPayment;
            client.users.update({
              user_id: customerId,
              custom_attributes: change
            }).catch(e => {
              log.info(e);
            });
          } else {
            log.info('There is no corresponding customer_id or there is no order');
          }
        }
      });
    } else if (contentObject.email) {
      const queryWithEmail = `SELECT customer_id, guest_id, status, promoter_id, payment, id FROM public.order WHERE email = ${contentObject.email};`;
      connPool.query(queryWithEmail, [], (err, result) => {
        if (err) {
          log.info('Error executing query');
        } else {
          let totalPayment = 0;
          const statusMap = new Map();
          let numOrders = 0;
          const change = {};
          if (result.rows.length > 0) {
            result.rows.forEach(element => {
              totalPayment += Number.parseInt(element.payment, 10);
              const currentStatus = `status_num_${element.status}`;
              if (_publicConst.completedOrdersSignature.indexOf(element.status) !== -1) {
                numOrders += 1;
              }
              if (statusMap.has(currentStatus)) {
                statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
              } else {
                statusMap.set(currentStatus, 1);
              }
            });
            [...statusMap].forEach(element2 => {
              change[element2[0]] = element2[1];
            });
            change.num_orders = numOrders;
            change.total_payment = totalPayment;
            client.users.update({
              email: contentObject.email,
              custom_attributes: change
            }).catch(e => {
              log.info(e);
            });
          } else {
            log.info('There is no corresponding customer_id or there is no order');
          }
        }
      });
    }
  }, { noAck: true });
};

exports.default = updateOrderStatus;