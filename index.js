import { createServer } from 'node:http';
// import { once } from 'node:events';
import * as dotenv from 'dotenv';
import apiData from './src/api/api.js';
import { generateFinalTextToTelegram } from './src/func/index.js';
import { editMessageText, sendMessage } from './src/telegram-methods/index.js';

dotenv.config();

const {
  GROUP_MESSAGE_ID,
  GROUP_OVERWATCH_BR_ID,
  DEVELOPER_OWNER_ID,
  TOPIC_ID,
  NODE_ENV,
} = process.env;

const main = async () => {
  const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  // eslint-disable-next-line no-console
  console.log(`código executou=>${date}`);
  const dataObj = await apiData();
  const finalMessage = generateFinalTextToTelegram(dataObj);

  if (NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log('Ambiente de produção detectado, atualizando ranking no grupo');
    await editMessageText(GROUP_OVERWATCH_BR_ID, GROUP_MESSAGE_ID, finalMessage, date, TOPIC_ID);

    // eslint-disable-next-line no-console
    console.log(`código executou=>${date}`);
    return;
  }

  await sendMessage(DEVELOPER_OWNER_ID, finalMessage);
  // await sendMessage(DEVELOPER_OWNER_ID, `código executou=> ${date}`);
};
main();

async function pingRoute(request, response) {
  await sendMessage(DEVELOPER_OWNER_ID, 'ping!');
  response.end('Ok');
}

async function updateRoute(request, response) {
  await main();
  response.end('Ok');
}

async function handler(request, response) {
  if (request.url === '/ping' && request.method.toLowerCase() === 'get') {
    return pingRoute(request, response);
  }

  if (request.url === '/update' && request.method.toLowerCase() === 'get') {
    return updateRoute(request, response);
  }

  response.writeHead(404);
  response.end('not found!');
}

const app = createServer(handler)
  .listen(3000, () => console.log('listening to 3000'));

export { app };
