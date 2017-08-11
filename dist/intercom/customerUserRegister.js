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

const log = _bunyan2.default.createLogger({ name: 'customerUserRegister' });
const client = new _intercomClient.Client(_config2.default.get('thirdPartyPlatform.intercom'));

const customerUserRegister = ch => {
  // USER_REGISTER topic which will register the user
  ch.assertQueue('CUSTOMER:USER_REGISTER', { durable: true });
  ch.consume('CUSTOMER:USER_REGISTER', msg => {
    // Doensn't need toString(), since the message has been jsonified
    const userObject = JSON.parse(msg.content);
    // Preprocess to get result for intercom
    const name = `${userObject.first_name} ${userObject.last_name}`;
    const user = {
      name: name.trim(),
      email: userObject.email,
      user_id: userObject.customer_id,
      phone: userObject.phone,
      custom_attributes: {
        guest_id: null,
        is_from_guest: false,
        is_oauth_wechat: null,
        is_oauth_qq: null,
        num_orders: 0,
        total_payment: 0,
        category_slug_string: '',
        project_slug_string: '',
        status_num_pending: 0,
        status_num_paid: 0,
        status_num_drawing: 0,
        status_num_waiting_for_delivery: 0,
        status_num_waiting_for_delivery_unpaid: 0,
        status_num_delivered: 0,
        status_num_waiting_for_pickup: 0,
        status_num_waiting_for_pickup_unpaid: 0,
        status_num_completed: 0,
        status_num_closed: 0,
        status_num_refund_pending: 0,
        status_num_refunded: 0,
        status_num_refund_failed: 0,
        promoter_username_string: ''
      }
    };
    client.users.create(user).catch(e => {
      log.info(e);
    });
  }, { noAck: true });
};

exports.default = customerUserRegister;