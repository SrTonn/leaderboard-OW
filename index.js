require('dotenv').config();
const axios = require('axios').default;
const apiData = require('./src/api/api');
const { generateFinalTextToTelegram } = require('./src/func');

const {
  BOT_TOKEN,
  GROUP_MESSAGE_ID,
  GROUP_OVERWATCH_BR_ID,
} = process.env;

const sendMessageToTelegram = async () => {
  const dataObj = await apiData();
  const finalMessage = generateFinalTextToTelegram(dataObj);
  const data = new Date().toLocaleString();
  console.log(`executei\n${data}`);

  /* editar mensagem fixada no grupo */
  await axios({
    method: 'post',
    url: `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
    data: {
      chat_id: GROUP_OVERWATCH_BR_ID,
      text: `${finalMessage}updated ${data}`,
      message_id: GROUP_MESSAGE_ID,
      entities: [{
        offset: 0,
        length: finalMessage.length,
        type: 'code',
      }],
    },
  });
};

sendMessageToTelegram();

setInterval(() => {
  sendMessageToTelegram();
}, 1000 * 60 * 15);
