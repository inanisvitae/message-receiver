import { Client } from 'intercom-client';
import config from 'config';
import pg from 'pg';
import bunyan from 'bunyan';
import { completedOrdersSignature } from './publicConst';

const log = bunyan.createLogger({ name: 'customerSyncGuestOrder' });
const client = new Client(config.get('thirdPartyPlatform.intercom'));
const connPool = new pg.Pool(config.get('database.pg'));


// Generates the whole customer attributes object
const customAttributesReducer = (customerId) => {
  client.users.find({ user_id: customerId })
    .then(() => {
      // Should deal with qq and wechat
      const copyCustomAttrs = {
        num_orders: 0,
        total_payment: 0,
        category_slug_string: '',
        project_slug_string: '',
        status_num_pending: 0, // -1
        status_num_pending_deleted: 0, // +1
        status_num_paid: 0,
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
        promoter_username_string: '',
      };

      // Query may have some bugs
      const query = `SELECT t1.customer_id AS customer_id, t1.guest_id AS guest_id, t1.status AS status, t1.deleted_at AS deleted_at, t2.username AS promoter_username_string, t1.id AS id, t1.payment AS payment, t3.project_id AS project_id, t3.project_slug AS project_slug, t5.slug AS category_slug FROM(SELECT customer_id, guest_id, status, deleted_at, promoter_id, payment, id FROM public.order WHERE customer_id = ${Number.parseInt(customerId, 10)}) t1, (SELECT username, id FROM public.promoter) t2, (SELECT project_slug, order_id, id, project_id FROM public.order_detail) t3, (SELECT project_id, category_id FROM public.project_to_category) t4, (SELECT slug, id FROM public.category) t5 WHERE t1.promoter_id = t2.id AND t3.order_id = t1.id AND t4.project_id = t3.project_id AND t3.category_id = t5.id; `;

      connPool.query(query, [], (err, resultQuery) => {
        if (!err) {
          if (resultQuery) {
            const rows = resultQuery.rows;
            if (rows.length <= 0) return;
            let numOrders = 0;
            let totalPayment = 0;

            rows.forEach((element) => {
              const checkStatus = `status_num_${element.status}`;
              if (completedOrdersSignature.indexOf(element.status) !== -1) {
                numOrders += 1;
              }

              copyCustomAttrs[checkStatus] = Number.parseInt(copyCustomAttrs[checkStatus], 10);
              copyCustomAttrs[checkStatus] += 1;
              totalPayment += Number.parseInt(element.payment, 10);

              if (!copyCustomAttrs.project_slug_string.includes(element.project_slug)) {
                if (copyCustomAttrs.project_slug_string === '') {
                  copyCustomAttrs.project_slug_string = `,${element.project_slug},`;
                } else {
                  copyCustomAttrs.project_slug_string += `${element.project_slug},`;
                }
              }

              if (!copyCustomAttrs.category_slug_string.includes(element.category_slug)) {
                if (copyCustomAttrs.category_slug_string === '') {
                  copyCustomAttrs.category_slug_string = `,${element.category_slug},`;
                } else {
                  copyCustomAttrs.category_slug_string += `${element.category_slug},`;
                }
              }

              if (!copyCustomAttrs.promoter_username_string.includes(element.username)) {
                if (copyCustomAttrs.promoter_username_string === '') {
                  copyCustomAttrs.promoter_username_string = `,${element.username},`;
                } else {
                  copyCustomAttrs.promoter_username_string += `${element.username},`;
                }
              }
            });

            copyCustomAttrs.total_payment = totalPayment;

            copyCustomAttrs.num_orders = numOrders;

            client.users.update({
              user_id: customerId,
              custom_attributes: copyCustomAttrs,
            }).catch((e) => {
              log.info(e);
            });
          }
        }
      });
    }).catch((err) => {
      log.info(err);
    });
};

const syncGuestOrders = (ch) => {
  // CUSTOMER:SYNC_GUEST_ORDERS synchronizes the orders
  ch.assertQueue('CUSTOMER:SYNC_GUEST_ORDERS', { durable: true });
  ch.consume('CUSTOMER:SYNC_GUEST_ORDERS', (msg) => {
    const contentObject = JSON.parse(msg.content);
    const customerId = contentObject.customer_id;
    // And reduce the custom_attributes
    customAttributesReducer(customerId);
  }, { noAck: true });
};

export default syncGuestOrders;
