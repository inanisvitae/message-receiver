'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _intercomClient = require('intercom-client');

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _bunyan2.default.createLogger({ name: 'customerUpdateCustomerInfo' });
const client = new _intercomClient.Client(_config2.default.get('thirdPartyPlatform.intercom'));

const updateCustomerInfo = ch => {
  ch.assertQueue('CUSTOMER:UPDATE_CUSTOMER_INFO', { durable: true });
  ch.consume('CUSTOMER:UPDATE_CUSTOMER_INFO', msg => {
    const contentObject = JSON.parse(msg.content);
    const data = contentObject.data;
    const customerId = contentObject.id;
    if (data.mobile) {
      // Mobile is available
      client.users.update({
        user_id: customerId,
        phone: data.mobile
      }).catch(e => {
        log.info(e);
      });
    }
    if (data.email) {
      // Email is available
      client.users.update({
        user_id: customerId,
        email: data.email
      }).catch(e => {
        log.info(e);
      });
    }
    if (data.first_name || data.last_name) {
      const nameString = `${data.first_name} ${data.last_name}`;
      const updateNameString = nameString.trim();

      client.users.update({
        user_id: customerId,
        name: updateNameString
      }).catch(e => {
        log.info(e);
      });
    }

    if (data.tpp_type) {
      // Tpp is available
      try {
        const tempCustomAttributes = {};
        tempCustomAttributes[`is_oauth_${data.tpp_type.toLowerCase()}`] = true;
        client.users.update({
          user_id: customerId,
          custom_attributes: tempCustomAttributes
        }).catch(e => {
          log.info(e);
        });
      } catch (e) {
        log.info('Unable to change tpp_type');
      }
    }
  });
};

exports.default = updateCustomerInfo;