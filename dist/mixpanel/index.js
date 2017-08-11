'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mixpanel = require('mixpanel');

var _mixpanel2 = _interopRequireDefault(_mixpanel);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = _bunyan2.default.createLogger({ name: 'mixpanel' });
const mixpanel = _mixpanel2.default.init(_config2.default.get('analytics.mixpanel.token'));

const trackCharge = (distinctId, amount, properties = null, modifiers = null, callback = null) => {
  try {
    mixpanel.people.track_charge(distinctId, amount, properties, modifiers, callback);
  } catch (e) {
    log.info(e);
  }
};
const track = (event, properties = null, callback = null) => {
  try {
    mixpanel.track(event, properties, callback);
  } catch (e) {
    log.info(e);
  }
};
const trackSignedUp = (custId, properties) => {
  try {
    if (properties.distinct_id) {
      mixpanel.alias(properties.distinct_id, custId);
    }
    mixpanel.track('Account Created', properties);
  } catch (e) {
    log.info(e);
  }
};
const addListenerMixpanel = conn => {
  conn.then(result => {
    result.createChannel().then(ch => {
      const topic1 = 'CUSTOMER:USER_REGISTER';
      const topic2 = 'CUSTOMER:AUTOMATIC_USER_REGISTER';
      const topic3 = 'ORDER:COMPLETE_PAYMENT';
      // userRegister topic which will register the user
      ch.assertQueue(topic1, { durable: true });
      ch.consume(topic1, msg => {
        const userObject = JSON.parse(msg.content);
        trackSignedUp(userObject.customer_id, {
          distinct_id: userObject.distinct_id,
          'Within Checkout Process': false,
          'Registration Method': userObject.reg_method,
          'First Name': '',
          'Last Name': '',
          Email: userObject.email,
          'Phone Number': userObject.phone,
          'Registration Date': userObject.created_at
        });
      }, { noAck: true });

      // submitOrder topic which will submit an order
      ch.assertQueue(topic2, { durable: true });
      ch.consume(topic2, msg => {
        const contentObject = JSON.parse(msg.content);
        trackSignedUp(contentObject.customer_id, {
          distinct_id: contentObject.distinct_id,
          'Within Checkout Process': true,
          'Registration Method': 'email - guest',
          'First Name': '',
          'Last Name': '',
          Email: contentObject.email,
          'Phone Number': '',
          'Registration Date': contentObject.created_at
        });
      }, { noAck: true });
      // submitOrder topic which will submit an order
      ch.assertQueue(topic3, { durable: true });
      ch.consume(topic3, msg => {
        const contentObject = JSON.parse(msg.content);
        const trackObject = {
          'Order ID': contentObject.order_id,
          'Order Number': contentObject.order_number,
          'Event Name': contentObject.event_name,
          'Delivery Method': contentObject.delivery_method,
          'Cart Size': contentObject.cart_size,
          'Cart Value': contentObject.cart_value,
          'Payment type': contentObject.payment_type,
          'Total Charge': contentObject.total_charge,
          'Mis Fees': contentObject.mis_fees,
          'Delivery Fees': contentObject.delivery_fees,
          Coupon: contentObject.coupon
        };

        const trackItems = {
          'Cart Items - Session IDs': [],
          'Cart Items - Session Names': [],
          'Cart Items - Session Dates': [],
          'Cart Items - Session Times': [],
          'Cart Items - Ticket IDs': [],
          'Cart Items - Ticket Names': [],
          'Cart Items - Ticket Prices': [],
          'Cart Items - Quantities': []
        };

        contentObject.items.forEach(item => {
          trackItems['Cart Items - Session IDs'].push(item.show_id);
          trackItems['Cart Items - Session Names'].push(item.show_label || '');
          trackItems['Cart Items - Session Dates'].push(item.show_date);
          trackItems['Cart Items - Session Times'].push(item.show_time || '');
          trackItems['Cart Items - Ticket IDs'].push(item.pricing_id);
          trackItems['Cart Items - Ticket Names'].push(item.pricing_label || '');
          trackItems['Cart Items - Ticket Prices'].push(item.price / 100);
          trackItems['Cart Items - Quantities'].push(item.quantity);
        });

        if (contentObject.distinct_id) {
          trackCharge(contentObject.distinct_id, contentObject.total_charge);
          track('Complete Purchase', Object.assign({ distinct_id: contentObject.distinct_id }, trackObject, trackItems));
        } else {
          track('Complete Purchase', Object.assign({}, trackObject, trackItems));
        }
      }, { noAck: true });
    }).catch(e => {
      log.info(e);
    });
  }).catch(e => {
    log.info(e);
  });
};

exports.default = addListenerMixpanel;