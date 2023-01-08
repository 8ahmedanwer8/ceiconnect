import ADJECTIVES from "./random_username_components/adjectives";
import ANIMALS from "./random_username_components/animals";

export const formatAMPM = (date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

export const generateRandomUsername = () => {
  var animal =
    ANIMALS.animals[Math.floor(Math.random() * ANIMALS.animals.length)];
  var adjective =
    ADJECTIVES.adjectives[
      Math.floor(Math.random() * ADJECTIVES.adjectives.length)
    ];
  var number = Math.floor(Math.random() * 1000);
  return `${adjective}${animal}${number}`;
};
