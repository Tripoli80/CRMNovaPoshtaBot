const { parse, differenceInDays } = require("date-fns");
const { getTrackingData } = require("../utils/apiNP");
const { sendMassage } = require("../utils/telegramApi");
const { updateDealStage } = require("../utils/ubdateStage");
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

    const { StatusCode, DateCreated, ActualDeliveryDate } = trackingData;
    const isArrived = StatusCode === "7";
    const isFinish =
      StatusCode === "9" || StatusCode === "10" || StatusCode === "11";
    if (isFinish) {
      const isUpdated = await updateDealStage({ dealId, newStageId });
      if (isUpdated)
        return res.status(200).json({
          message: "deal win",
        });
      return res.status(200).json({
        message: "deal win but not updated in CRM",
      });
    }
    const currentDate = new Date();
    const createdDate = parse(DateCreated, patternDateNP, new Date());
    // const daysSinceSent = differenceInDays(currentDate, createdDate);

    if (!isArrived) {
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
