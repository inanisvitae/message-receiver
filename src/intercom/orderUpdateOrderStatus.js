import { Client } from 'intercom-client';
import config from 'config';
import pg from 'pg';
import bunyan from 'bunyan';
import { completedOrdersSignature } from './publicConst';

const log = bunyan.createLogger({ name: 'orderUpdateOrderStatus' });
const client = new Client(config.get('thirdPartyPlatform.intercom'));
const connPool = new pg.Pool(config.get('database.pg'));


const updateOrderStatus = (ch) => {
  // ORDER:UPDATE_ORDER_STATUS to update the status of the order * debugged
  ch.assertQueue('ORDER:UPDATE_ORDER_STATUS', { durable: true });
  ch.consume('ORDER:UPDATE_ORDER_STATUS', (msg) => {
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
            result.rows.forEach((element) => {
              totalPayment += Number.parseInt(element.payment, 10);
              // Should also check whether a pending order has been deleted or not
              let currentStatus = `status_num_${element.status}`;
              // To check the status to see whether it's a deleted pending order
              if (element.status === 'pending') {
                if (element.deleted_at) {
                  currentStatus += '_deleted';
                }
              }
              if (completedOrdersSignature.indexOf(element.status) !== -1) {
                numOrders += 1;
              }
              if (statusMap.has(currentStatus)) {
                statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
              } else {
                statusMap.set(currentStatus, 1);
              }
            });
            [...statusMap].forEach((element2) => {
              change[element2[0]] = element2[1];
            });
            change.num_orders = numOrders;
            change.total_payment = totalPayment;
            client.users.update({
              user_id: customerId,
              custom_attributes: change,
            }).catch((e) => {
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
            result.rows.forEach((element) => {
              totalPayment += Number.parseInt(element.payment, 10);
              const currentStatus = `status_num_${element.status}`;
              if (completedOrdersSignature.indexOf(element.status) !== -1) {
                numOrders += 1;
              }
              if (statusMap.has(currentStatus)) {
                statusMap.set(currentStatus, statusMap.get(currentStatus) + 1);
              } else {
                statusMap.set(currentStatus, 1);
              }
            });
            [...statusMap].forEach((element2) => {
              change[element2[0]] = element2[1];
            });
            change.num_orders = numOrders;
            change.total_payment = totalPayment;
            client.users.update({
              email: contentObject.email,
              custom_attributes: change,
            }).catch((e) => {
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

export default updateOrderStatus;
