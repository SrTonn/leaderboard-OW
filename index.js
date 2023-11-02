import { createServer } from 'node:http';
import * as dotenv from 'dotenv';
import apiData from './src/api/api';
import { generateFinalTextToTelegram } from './src/func/index';
import { editMessageText, sendMessage } from './src/telegram-methods/index';
import * as supabase from './src/database/index';

dotenv.config();

const {
  GROUP_MESSAGE_ID,
  GROUP_OVERWATCH_BR_ID,
  DEVELOPER_OWNER_ID,
  TOPIC_ID,
  NODE_ENV,
  PORT,
} = process.env;

async function pingRoute(request, response) {
  await sendMessage(DEVELOPER_OWNER_ID, 'pong!');
  response.end('Ok');
}

async function updateRoute(request, response) {
  // const startTime = performance.now();
  const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  // eslint-disable-next-line no-console
  const battleTags = await supabase.getData().then((res) => res.data);

  if (battleTags.length < 1) {
    console.warn('Nenhuma battletag foi retornada');
    response.writeHead(204);
    return response.end();
  }
  const dataObj = await apiData(battleTags);

  const objWithError = dataObj.filter((obj) => obj.error && obj.error !== null);
  supabase.update(objWithError);
  const finalMessage = generateFinalTextToTelegram(dataObj);

  if (NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.log('Ambiente de produção detectado, atualizando ranking no grupo');
    await editMessageText(GROUP_OVERWATCH_BR_ID, GROUP_MESSAGE_ID, finalMessage, date, TOPIC_ID);

    // eslint-disable-next-line no-console
    return response.end('Ok');
  }

  await sendMessage(DEVELOPER_OWNER_ID, finalMessage);
  response.end('Ok');
}

async function updateDatabase(request, response) {
  const battleTags = await supabase.getAllData().then((res) => res.data);

  const dataObj = await apiData(battleTags);

  supabase.update(dataObj);

  response.end('Database atualizado');
}

async function handler(request, response) {
  if (request.url === '/ping' && request.method.toLowerCase() === 'get') {
    return pingRoute(request, response);
  }

  if (request.url === '/update' && request.method.toLowerCase() === 'get') {
    return updateRoute(request, response);
  }

  if (request.url === '/db/update' && request.method.toLowerCase() === 'get') {
    return updateDatabase(request, response);
  }

  response.writeHead(404);
  response.end('not found!');
}

// eslint-disable-next-line no-console
const app = createServer(handler).listen(PORT, () => console.log(`listening to ${PORT}`));

export { app };
