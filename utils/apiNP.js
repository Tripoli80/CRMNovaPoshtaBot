const axios = require("axios");
const getTrackingData = async (trackingNumber) => {
  const response = await axios.post("https://api.novaposhta.ua/v2.0/json/", {
    apiKey: process.env.API_KEY,
    modelName: "TrackingDocument",
    calledMethod: "getStatusDocuments",
    methodProperties: {
      Documents: [
        {
          DocumentNumber: trackingNumber,
          Phone: "",
        },
      ],
    },
  });

  const trackingData = response.data.data[0];
  return trackingData;
};
module.exports = { getTrackingData };
