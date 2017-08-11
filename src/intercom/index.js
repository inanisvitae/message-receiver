import bunyan from 'bunyan';
import customerUserRegister from './customerUserRegister';
import userAutomaticRegister from './customerUserAutomaticRegister';
import completePayment from './orderCompletePayment';
import updateOrderStatus from './orderUpdateOrderStatus';
import deletePendingOrder from './orderDeletePendingOrder';
import createOrder from './orderCreateOrder';
import syncGuestOrders from './customerSyncGuestOrders';
import updateCustomerInfo from './customerUpdateCustomerInfo';
import orderBackendUpdateOrderStatus from './orderBackendUpdateOrderStatus';
import customerAddCollection from './customerAddCollection';
import customerRemoveCollection from './customerRemoveCollection';

const log = bunyan.createLogger({ name: 'intercom' });

const addListenerIntercom = (conn) => {
  conn.then((result) => {
    result.createChannel().then((ch) => {
      customerUserRegister(ch);
      userAutomaticRegister(ch);
      completePayment(ch);
      updateOrderStatus(ch);
      deletePendingOrder(ch);
      createOrder(ch);
      syncGuestOrders(ch);
      updateCustomerInfo(ch);
      orderBackendUpdateOrderStatus(ch);
      customerAddCollection(ch);
      customerRemoveCollection(ch);
    }).catch((e) => {
      log.info(e);
    });
  }).catch((e) => {
    log.info(e);
  });
};

export default addListenerIntercom;
