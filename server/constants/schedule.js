const SCHEDULE = Object.freeze({
  WORK_DAY: "workday",
  REST_DAY: "restday",
  HOLIDAY: "holiday",
  ABSENT: "absent",
  SUSPENDED: "suspended",
  UNDERTIME: "undertime",

  // For vidaXL only
  REPORTING: "reporting",

  // Leave types
  SICK_LEAVE: "sick leave",
  VACATION_LEAVE: "vacation leave",
  MATERNITY_LEAVE: "maternity leave",
  PATERNITY_LEAVE: "paternity leave",
  SOLO_PARENT_LEAVE: "solo parent leave",
  LIVE_WITHOUT_PAY: "live without pay",
  EMERGENCY_LEAVE: "emergency leave",
});

export default SCHEDULE;
