import config from 'config';
import bunyan from 'bunyan';
import amqp from 'amqplib';
import addListenerIntercom from './intercom';
import addListenerMixpanel from './mixpanel';


const log = bunyan.createLogger({ name: 'message_receiver' });

const establishConn = async () => {
  try {
    return await amqp.connect(config.get('messageQueue.host'));
  } catch (e) {
    log.info('Failed to establish connection');
    return null;
  }
};

const conn = establishConn();

addListenerIntercom(conn);
addListenerMixpanel(conn);
