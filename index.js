require('dotenv').config();
const axios = require('axios').default;
const apiData = require('./src/api/api');
const { generateFinalTextToTelegram } = require('./src/func');

const {
  BOT_TOKEN,
  GROUP_MESSAGE_ID,
  GROUP_OVERWATCH_BR_ID,
  DEVELOPER_OWNER_ID,
  NODE_ENV,
} = process.env;

const sendMessageToTelegram = async () => {
  const dataObj = await apiData();
  const finalMessage = generateFinalTextToTelegram(dataObj);
  const data = new Date().toLocaleString();
  console.log(`executei\n${data}`);

  if (NODE_ENV === 'production') {
    try {
      await axios({ /* editar mensagem fixada no grupo */
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
    } catch (error) {
      console.error(error);
    }
  }

  try {
    await axios({ /* enviar mensagem privada para Tonn */
      method: 'post',
      url: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      data: {
        chat_id: DEVELOPER_OWNER_ID,
        text: `${finalMessage}updated ${data}\n> development mode`,
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
