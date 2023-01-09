export const formatAMPM = (date: Date) => {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = Number(minutes.toString().padStart(2, "0")); //typescript is great ahhahha
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};
