// Status of the employees
export const STATUS = Object.freeze({
  ON_BREAK: "On Break",
  ON_LUNCH: "On Lunch",
  WORKING: "Working",
  OOF: "Out of Office",
});

export const STATUS_COLORS = Object.freeze({
  [STATUS.ON_BREAK]: { bgColor: "#C2E6E1", textColor: "#00B69B" },
  [STATUS.ON_LUNCH]: { bgColor: "#F5E3C6", textColor: "#B48B47" },
  [STATUS.WORKING]: { bgColor: "#D1C2F4", textColor: "#4B00FC" },
  [STATUS.OOF]: { bgColor: "#F5CDCD", textColor: "#FF3838" },
});
