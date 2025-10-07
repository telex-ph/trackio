import { STATUS } from "./status";

export const ATTENDANCE_FIELDS = Object.freeze({
  TIME_IN: "timeIn",
  TIME_OUT: "timeOut",
  FIRST_BREAK_START: "firstBreakStart",
  FIRST_BREAK_END: "firstBreakEnd",
  LUNCH_START: "lunchStart",
  LUNCH_END: "lunchEnd",
  SECOND_BREAK_START: "secondBreakStart",
  SECOND_BREAK_END: "secondBreakEnd",
});

export const TIME_BOX_CONFIG = Object.freeze([
  Object.freeze({
    id: "timeIn",
    title: "Time In",
    isTwoBtn: false,
    fieldOne: ATTENDANCE_FIELDS.TIME_IN,
    fieldOneStatus: STATUS.WORKING,
    bgColor: "C2E6E1",
    textColor: "00B69B",
    isSpecial: true, // Special handling for time in
  }),
  Object.freeze({
    id: "firstBreak",
    title: "1st Break",
    isTwoBtn: true,
    fieldOne: ATTENDANCE_FIELDS.FIRST_BREAK_START,
    fieldTwo: ATTENDANCE_FIELDS.FIRST_BREAK_END,
    fieldOneStatus: STATUS.ON_BREAK,
    fieldTwoStatus: STATUS.WORKING,
    bgColor: "F5E3C6",
    textColor: "B48B47",
  }),
  Object.freeze({
    id: "lunch",
    title: "Lunch",
    isTwoBtn: true,
    fieldOne: ATTENDANCE_FIELDS.LUNCH_START,
    fieldTwo: ATTENDANCE_FIELDS.LUNCH_END,
    fieldOneStatus: STATUS.ON_LUNCH,
    fieldTwoStatus: STATUS.WORKING,
    bgColor: "D1C2F4",
    textColor: "4B00FC",
  }),
  Object.freeze({
    id: "secondBreak",
    title: "2nd Break",
    isTwoBtn: true,
    fieldOne: ATTENDANCE_FIELDS.SECOND_BREAK_START,
    fieldTwo: ATTENDANCE_FIELDS.SECOND_BREAK_END,
    fieldOneStatus: STATUS.ON_BREAK,
    fieldTwoStatus: STATUS.WORKING,
    bgColor: "F5E3C6",
    textColor: "B48B47",
  }),
  Object.freeze({
    id: "timeOut",
    title: "Time Out",
    isTwoBtn: false,
    fieldOne: ATTENDANCE_FIELDS.TIME_OUT,
    fieldOneStatus: STATUS.OOF,
    bgColor: "F5CDCD",
    textColor: "FF3838",
  }),
]);
