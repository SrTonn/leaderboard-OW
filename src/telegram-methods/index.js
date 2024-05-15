import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  BOT_TOKEN,
} = process.env;

const sendMessage = async (chatId, message) => {
  try {
    await axios({ /* enviar mensagem privada para Tonn */
      method: 'post',
      url: `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      data: {
        chat_id: chatId,
        text: message,
        entities: [{
          offset: 0,
          length: message.length,
          type: 'code',
        }],
      },
    });
  } catch (error) {
    await sendMessage(chatId, message);
  }
};

const editMessageText = async (chatId, messageId, message, date, topicId) => {
  try {
    await axios({ /* editar mensagem fixada no grupo */
      method: 'post',
      url: `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`,
      data: {
        chat_id: chatId,
        message_thread_id: topicId || null,
        text: `${message}updated ${date}`,
        message_id: messageId,
        entities: [{
          offset: 0,
          length: message.length,
          type: 'code',
        }],
      },
    });
  } catch (error) {
    await editMessageText(chatId, messageId, message, date, topicId);
  }
};

export { sendMessage, editMessageText };
