import SCHEDULE from "../../constants/schedule";
import {
  BriefcaseBusiness,
  BedDouble,
  TentTree,
  ShieldQuestionMark,
  TreePalm,
  Baby,
  CalendarOff,
  FlagOff,
  AlarmClockMinus,
} from "lucide-react";
import { dateFormatter } from "../../utils/formatDateTime";
import { useStore } from "../../store/useStore";
import { useSchedule } from "../../hooks/useSchedule";
import { useParams } from "react-router-dom";
import React from "react";

// --- Custom Color Palette Hex Codes - UNIQUE Colors per Schedule Type ---
const COLORS = {
  // 1. WORK DAY (Bright Blue)
  INDIGO_DEEP: "#1E88E5", // Icon Color (Vibrant Blue)
  INDIGO_LIGHT: "#B3E5FC", // Card BG (Light Blue)
 
  // 2. REPORTING (Darker Blue)
  BLUE_DEEP: "#0044AA", // Icon Color (Darker Blue)
  BLUE_LIGHT: "#C0DFFF", // Card BG (Lighter Dark Blue)
 
  // 3. REST DAY (Green)
  GREEN_SUCCESS: "#00C853", // Icon Color (Vibrant Green)
  GREEN_LIGHT: "#C8E6C9", // Card BG (Light Green)
 
  // 4. UNDERTIME (Teal/Cyan)
  TEAL_DEEP: "#00695C", // Icon Color (Dark Teal)
  TEAL_LIGHT: "#B2DFDB", // Card BG (Light Teal)
 
  // 5. HOLIDAY (Yellow/Amber)
  AMBER_WARNING: "#FFAB00", // Icon Color (Gold/Amber)
  AMBER_LIGHT: "#FFF9C4", // Card BG (Light Yellow)
 
  // 6. ABSENT (Red)
  RED_ERROR: "#D50000", // Icon Color (Deep Red)
  RED_LIGHT: "#FFCDD2", // Card BG (Light Red)
 
  // 7. SUSPENDED (Violet)
  CRIMSON_DEEP: "#7B1FA2", // Icon Color (Violet)
  CRIMSON_LIGHT: "#E1BEE7", // Card BG (Light Violet)
 
  // 8. ALL LEAVES (Purple - Consistent color for all leave types)
  PURPLE_LEAVE: "#6200EE", // Icon Color (Deep Purple)
  PURPLE_LIGHT: "#E1BEE7", // Card BG (Light Purple)
 
  // Neutral Colors
  TEXT_DARK: "#1F2937",
  TEXT_SUBTLE: "#6B7280",
  CARD_BG: "#FFFFFF", // Used for Icon Background (White for Contrast)
  CARD_BORDER: "#E5E7EB",
  TODAY_RING: "#FF5722", // Orange for Today's highlight
};

const CalendarDay = ({ date, readOnly, handleRightClick, handleDateClick, handleOpenDetailsModal }) => {
  const user = useStore((state) => state.user);
  const { id } = useParams();

  const formattedDate = dateFormatter(date, "yyyy-MM-dd");
  const formmatedDay = dateFormatter(date, "d");
  const today = dateFormatter(new Date(), "yyyy-MM-dd");

  const { schedule: shiftSchedule } = useSchedule({
    id: readOnly ? user._id : id,
  });

  const schedule = shiftSchedule?.find(
    (schedule) => dateFormatter(schedule.date, "yyyy-MM-dd") === formattedDate
  );

  const getScheduleIcon = (type, color) => {
    // Icon size h-9 w-9
    const iconProps = { style: { color }, className: `h-9 w-9` };
    let IconComponent;

    switch (type) {
      case SCHEDULE.WORK_DAY: IconComponent = BriefcaseBusiness; break;
      case SCHEDULE.REPORTING: IconComponent = BriefcaseBusiness; break;
      case SCHEDULE.REST_DAY: IconComponent = BedDouble; break;
      case SCHEDULE.HOLIDAY: IconComponent = TentTree; break;
      case SCHEDULE.ABSENT: IconComponent = CalendarOff; break;
      case SCHEDULE.SUSPENDED: IconComponent = FlagOff; break;
      case SCHEDULE.UNDERTIME: IconComponent = AlarmClockMinus; break;
      case SCHEDULE.VACATION_LEAVE:
      case SCHEDULE.UNPAID_VACATION_LEAVE:
      case SCHEDULE.EMERGENCY_LEAVE: IconComponent = TreePalm; break;
      case SCHEDULE.MATERNITY_LEAVE:
      case SCHEDULE.PATERNITY_LEAVE:
      case SCHEDULE.SOLO_PARENT_LEAVE: IconComponent = Baby; break;
      default: IconComponent = ShieldQuestionMark;
    }
   
    const background = COLORS.CARD_BG;
    const shadowStyle = {
      boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 1px rgba(0, 0, 0, 0.2)`,
      transform: `translateY(-1px)`,
    };


    return (
      <div
        className="flex items-center justify-center p-1.5 rounded-full"
        aria-hidden
        style={{ backgroundColor: background, ...shadowStyle }}
      >
        <IconComponent {...iconProps} />
      </div>
    );
  };

  const getIconColor = (type) => {
    switch (type) {
      case SCHEDULE.WORK_DAY: return COLORS.INDIGO_DEEP;
      case SCHEDULE.REPORTING: return COLORS.BLUE_DEEP;
      case SCHEDULE.REST_DAY: return COLORS.GREEN_SUCCESS;
      case SCHEDULE.HOLIDAY: return COLORS.AMBER_WARNING;
      case SCHEDULE.ABSENT: return COLORS.RED_ERROR;
      case SCHEDULE.SUSPENDED: return COLORS.CRIMSON_DEEP;
      case SCHEDULE.UNDERTIME: return COLORS.TEAL_DEEP;
      case SCHEDULE.VACATION_LEAVE:
      case SCHEDULE.UNPAID_VACATION_LEAVE:
      case SCHEDULE.EMERGENCY_LEAVE:
      case SCHEDULE.MATERNITY_LEAVE:
      case SCHEDULE.PATERNITY_LEAVE:
      case SCHEDULE.SOLO_PARENT_LEAVE: return COLORS.PURPLE_LEAVE;
      default: return COLORS.TEXT_SUBTLE;
    }
  };
  const getCardStyle = (type) => {
    let background = COLORS.CARD_BG;
    let color = getIconColor(type);
    switch (type) {
      case SCHEDULE.WORK_DAY: background = COLORS.INDIGO_LIGHT; break;
      case SCHEDULE.REPORTING: background = COLORS.BLUE_LIGHT; break;
      case SCHEDULE.REST_DAY: background = COLORS.GREEN_LIGHT; break;
      case SCHEDULE.ABSENT: background = COLORS.RED_LIGHT; break;
      case SCHEDULE.SUSPENDED: background = COLORS.CRIMSON_LIGHT; break;
      case SCHEDULE.UNDERTIME: background = COLORS.TEAL_LIGHT; break;
      case SCHEDULE.VACATION_LEAVE:
      case SCHEDULE.UNPAID_VACATION_LEAVE:
      case SCHEDULE.EMERGENCY_LEAVE:
      case SCHEDULE.MATERNITY_LEAVE:
      case SCHEDULE.PATERNITY_LEAVE:
      case SCHEDULE.SOLO_PARENT_LEAVE: background = COLORS.PURPLE_LIGHT; break;
    }
    if (formattedDate === today) {
      return {
        background,
        boxShadow: `0 0 0 2px ${COLORS.TODAY_RING}`,
        border: `1px solid ${COLORS.TODAY_RING}`,
        textColor: COLORS.TODAY_RING,
      };
    }

    return {
      background,
      color,
      textColor: COLORS.TEXT_DARK
    };
  };

  const baseCardClass = "relative rounded-lg cursor-pointer w-full h-full";
  const cardStyle = getCardStyle(schedule?.type);
  const iconColor = getIconColor(schedule?.type);

  const formatScheduleText = (type) => {
    if (type === SCHEDULE.REPORTING) return "REPORTING (FOR VIDAXL ONLY)";
    return type?.replace(/_/g, " ").toUpperCase();
  };

  if (
    schedule?.type &&
    [
      SCHEDULE.WORK_DAY,
      SCHEDULE.REPORTING,
      SCHEDULE.REST_DAY,
      SCHEDULE.HOLIDAY,
      SCHEDULE.ABSENT,
      SCHEDULE.SUSPENDED,
      SCHEDULE.UNDERTIME,
      SCHEDULE.VACATION_LEAVE,
      SCHEDULE.UNPAID_VACATION_LEAVE,
      SCHEDULE.EMERGENCY_LEAVE,
      SCHEDULE.MATERNITY_LEAVE,
      SCHEDULE.PATERNITY_LEAVE,
      SCHEDULE.SOLO_PARENT_LEAVE,
    ].includes(schedule.type)
  ) {
    return (
      <section
        className={baseCardClass}
        style={{
          height: "100%",
          minHeight: "80px",
          width: "100%",
          boxShadow: cardStyle.boxShadow,
          border: cardStyle.border,
          backgroundColor: cardStyle.background,
        }}
        onContextMenu={handleRightClick}
        onClick={() => {
            handleDateClick(date);
            handleOpenDetailsModal(schedule);
        }}
      >
        <div className="p-1 w-full h-full flex flex-col justify-start items-center">
          <span className={`text-sm font-normal block mb-1`} style={{ color: cardStyle.textColor }}>{formmatedDay}</span>
          <div className="flex justify-center items-center flex-col mt-1">

            {getScheduleIcon(schedule?.type, iconColor)}
          </div>
          <span className="text-xs font-semibold mt-1 truncate w-full px-1 text-center" style={{ color: iconColor }}>
            {formatScheduleText(schedule.type)}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section
      className={baseCardClass}
      style={{ height: "100%", minHeight: "80px", boxShadow: cardStyle.boxShadow, border: cardStyle.border }}
      onContextMenu={handleRightClick}
      onClick={() => handleDateClick(date)}
    >
      <div className="p-1 w-full h-full flex flex-col justify-start items-center">
        <span className="text-sm font-normal block text-gray-700">{formmatedDay}</span>
        <span className="text-xs text-gray-400 mt-1">---</span>
      </div>
    </section>
  );
};

export default CalendarDay;
