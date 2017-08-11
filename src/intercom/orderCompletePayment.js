import { Client } from 'intercom-client';
import config from 'config';
import pg from 'pg';
import bunyan from 'bunyan';
import { completedOrdersSignature } from './publicConst';

const log = bunyan.createLogger({ name: 'orderCompletePayment' });
const client = new Client(config.get('thirdPartyPlatform.intercom'));
const connPool = new pg.Pool(config.get('database.pg'));

const completePayment = (ch) => {
  // ORDER:COMPLETE_PAYMENT topic which will submit an order * debugged
  ch.assertQueue('ORDER:COMPLETE_PAYMENT', { durable: true });
  ch.consume('ORDER:COMPLETE_PAYMENT', (msg) => {
    // Doensn't need toString(), since the message has been jsonified
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
    }
  }, { noAck: true });
};

export default completePayment;

