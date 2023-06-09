const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const webhookUrl = process.env.B24_WEBHOOK_URL; // Замените на ваш вебхук

async function updateDealStage({ dealId, newStageId }) {
  try {
    const response = await axios.post(`${webhookUrl}/crm.deal.update`, {
      id: dealId,
      fields: {
        STAGE_ID: newStageId,
      },
    });

    if (response.data.result) {
      console.log("Сделка успешно обновлена");
      return true;
    } else {
      console.error("Не удалось обновить сделку");
      return false;
    }
  } catch (error) {
    console.log("🚀ubdateStage.js", error);
    // console.error("Произошла ошибка при обновлении сделки");
  }
}

async function updateDealDays({ dealId, daysInWarehouse }) {
  try {
    const response = await axios.post(`${webhookUrl}/crm.deal.update`, {
      id: dealId,
      fields: {
        UF_CRM_1680872708: +daysInWarehouse,
      },
    });

    if (response.data.result) {
      console.log("Сделка успешно обновлена");
      return true;
    } else {
      console.error("Не удалось обновить сделку");
      return false;
    }
  } catch (error) {
    console.log("ubdateStage.js", error);
    // console.error("Произошла ошибка при обновлении сделки");
  }
}
async function updateDealFields({ dealId, fields }) {
  try {
    const response = await axios.post(`${webhookUrl}/crm.deal.update`, {
      id: dealId,
      fields
    });

    if (response.data.result) {
      console.log("Сделка успешно обновлена");
      return true;
    } else {
      console.error("Не удалось обновить сделку");
      return false;
    }
  } catch (error) {
    console.log("ubdateStage.js", error);
    // console.error("Произошла ошибка при обновлении сделки");
  }
}
module.exports = { updateDealStage, updateDealDays , updateDealFields};
