const { parse, differenceInDays } = require("date-fns");
const { getTrackingData } = require("../utils/apiNP");
const { sendMassage } = require("../utils/telegramApi");
const {
  updateDealStage,
  updateDealDays,
  updateDealFields,
} = require("../utils/ubdateStage");
const newStageId = "C1:WON";
const patternDateNP = "dd-MM-yyyy HH:mm:ss";
const patternActualDeliveryDate = "yyyy-MM-dd HH:mm:ss";

const checkDays = async (req, res) => {
  try {
    let { ttn, limitday = 3, dealId, responsible = " - " } = req.query;
    if (isNaN(limitday)) limitday = 3;
    if (!ttn)
      return res.status(400).json({ message: "Отсутствует трекинг-номер" });
    const trackingNumber = ttn.replace(/[\s-_]/g, "");
    const trackingData = await getTrackingData(trackingNumber);
    if (!trackingData)
      return res.status(404).json({ message: "Посылка не найдена" });

    const { StatusCode, DateCreated, ActualDeliveryDate, Status } =
      trackingData;

    await updateDealFields({
      dealId,
      fields: {
        UF_CRM_1680877332354: Status,
      },
    });
    let status = 0;
    switch (StatusCode) {
      case "103":
      case "102":
      case "111":
        status = 400;
        break;
      case "7":
        status = 300;
        break;
      case "9":
      case "11":
      case "10":
        status = 200;
        break;
    }

    // const isArrived = StatusCode === "7";
    // const isBrake = StatusCode === "103" || StatusCode === "102";
    // const isFinish =
    //   StatusCode === "9" || StatusCode === "10" || StatusCode === "11";

    if (status === 200) {
      const isUpdated = await updateDealStage({ dealId, newStageId });
      let message = "deal win but not updated in CRM";
      if (isUpdated) message = "deal win";
      return res.status(200).json({ message });
    }

    if (status === 400) {
      const messageText = `Отказ от посылки ${trackingNumber}. ${responsible}`;
      await sendMassage({ messageText, dealId });
      return res.status(200).json({ messageText });
    }

    const currentDate = new Date();
    const createdDate = parse(DateCreated, patternDateNP, new Date());
    // const daysSinceSent = differenceInDays(currentDate, createdDate);

    if (status !== 300) {
      return res.status(200).json({
        message: "Not Arrived",
      });
    }

    const warehouseArrivalDate = parse(
      ActualDeliveryDate,
      patternActualDeliveryDate,
      new Date()
    );

    const daysInWarehouse = differenceInDays(currentDate, warehouseArrivalDate);
    await updateDealDays({ dealId, daysInWarehouse });
    if (+daysInWarehouse >= +limitday) {
      const messageText = `Посылка ${trackingNumber} на складе уже ${daysInWarehouse} дней. ${responsible}`;
      await sendMassage({ messageText, dealId });
    }

    res.status(200).json({
      message: "Посылка прибыла",
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
};

module.exports = { checkDays };
