require('dotenv').config();
const axios = require('axios').default;
const express = require('express');
const apiData = require('./src/api/api');
const { generateFinalTextToTelegram } = require('./src/func');

const app = express();
const PORT = process.env.PORT || 3030;

const {
  BOT_TOKEN,
  GROUP_MESSAGE_ID,
  GROUP_OVERWATCH_BR_ID,
  DEVELOPER_OWNER_ID,
  TOPIC_ID,
  NODE_ENV,
} = process.env;

const sendMessageToTelegram = async () => {
  const dataObj = await apiData();
  const finalMessage = generateFinalTextToTelegram(dataObj);
  const date = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  if (NODE_ENV === 'production') {
    try {
      await axios({ /* editar mensagem fixada no grupo */
        method: 'post',
        url: `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
        data: {
          chat_id: GROUP_OVERWATCH_BR_ID,
          message_thread_id: TOPIC_ID || null,
          text: `${finalMessage}updated ${date}`,
          message_id: GROUP_MESSAGE_ID,
          entities: [{
            offset: 0,
            length: finalMessage.length,
            type: 'code',
          }],
        },
      });
    } catch (error) {
      console.error(error);
    }

    return;
  }

  try {
    await axios({ /* enviar mensagem privada para Tonn */
      method: 'post',
      url: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      data: {
        chat_id: DEVELOPER_OWNER_ID,
        message_thread_id: TOPIC_ID || null,
        text: `${finalMessage}updated ${date}\n> development mode`,
        entities: [{
          offset: 0,
          length: finalMessage.length,
          type: 'code',
        }],
      },
    });
  } catch (error) {
    console.error(error);
  }
};

sendMessageToTelegram();

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
