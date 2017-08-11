import { Client } from 'intercom-client';
import config from 'config';
import bunyan from 'bunyan';

const log = bunyan.createLogger({ name: 'orderDeletePendingOrder' });
const client = new Client(config.get('thirdPartyPlatform.intercom'));

const deletePendingOrder = (ch) => {
  // ORDER:DELETE_PENDING_ORDER to update the status of the order
  ch.assertQueue('ORDER:DELETE_PENDING_ORDER', { durable: true });
  ch.consume('ORDER:DELETE_PENDING_ORDER', (msg) => {
    const contentObject = JSON.parse(msg.content);
    const customerId = contentObject.customer_id;
    client.users.find({ user_id: customerId })
      .then((result) => {
        const change = {
          status_num_pending: result.body.custom_attributes.status_num_pending - 1,
          status_num_pending_deleted: result.body.custom_attributes.status_num_pending_deleted + 1,
        };
        client.users.update({
          user_id: customerId,
          custom_attributes: change,
        }).catch((e) => {
          log.info(e);
        });
      }).catch((e) => {
        log.info(e);
      });
  }, { noAck: true });
};


export default deletePendingOrder;
