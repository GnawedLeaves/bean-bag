import dayjs, { Dayjs } from "dayjs";
import weekday from "dayjs/plugin/weekday";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
dayjs.extend(weekday);
dayjs.extend(weekOfYear);

interface BlogCalendarProps {
  currentDate: Dayjs;
}

interface WeekItemDayLabelProps {
  selected?: boolean;
}

interface CalendarArrowProps {
  show?: boolean;
}
interface CalendarBigContainerProps {
  weekMode?: boolean;
}

interface WeekData {
  date: Dayjs;
  dayLabel: string;
  dayNumber: number;
}
export const BlogCalendarContainer = styled.div<CalendarBigContainerProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 ${(props) => props.theme.paddingLg}px;
  height: ${(props) => (props.weekMode ? "20vh" : "50vh")};
  transition: height 0.5s ease;
`;

export const BlogCalendarWeekContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const WeekItemContainer = styled.div<WeekItemDayLabelProps>`
  border-radius: 40px;
  border: 1px solid
    ${(props) => (props.selected ? props.theme.borderColor : "transparent")};
  padding: 8px 0px 0px 0px;
  display: flex;
  //   gap: 4px;
  flex-direction: column;
  align-items: center;
  width: 50px;
  height: 80px;
  justify-content: space-around;
  //   margin: 16px 0;
`;
export const WeekItemDayLabel = styled.div<WeekItemDayLabelProps>`
  color: ${(props) =>
    props.selected ? props.theme.text : props.theme.textSecondary};
  font-size: 12px;
`;
export const WeekItemDayNumber = styled.div<WeekItemDayLabelProps>`
  border-radius: 50%;
  background: ${(props) => (props.selected ? props.theme.text : "transparent")};
  //   padding: 12px;
  color: ${(props) =>
    props.selected ? props.theme.colorBg : props.theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
`;

export const CalendarTopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const CalendarTitle = styled.div`
  font-size: ${(props) => props.theme.fontSizeLg}px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

export const CalendarArrow = styled.div<CalendarArrowProps>`
  opacity: ${(props) => (props.show ? 1 : 0)};
  transition: 0.3s;
  color: ${(props) => props.theme.text};
`;

const BlogCalendar = ({ currentDate }: BlogCalendarProps) => {
  const [weekMode, setWeekMode] = useState<boolean>(true);
  const [weekData, setWeekData] = useState<WeekData[]>([]);

  const getWeekData = () => {
    const startOfWeek = currentDate.startOf("week");
    const weekDays: WeekData[] = [];

    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (let i = 0; i < 7; i++) {
      const date = startOfWeek.add(i, "day");
      weekDays.push({
        date: date,
        dayLabel: dayLabels[i],
        dayNumber: date.date(),
      });
    }

    setWeekData(weekDays);
  };

  // Call getWeekData when component mounts or currentDate changes
  useEffect(() => {
    getWeekData();
  }, [currentDate]);

  return (
    <BlogCalendarContainer weekMode={weekMode}>
      <CalendarTopBar>
        <CalendarArrow show={!weekMode}>
          <LeftOutlined />
        </CalendarArrow>
        <CalendarTitle>June</CalendarTitle>
        <CalendarArrow show={!weekMode}>
          <RightOutlined />
        </CalendarArrow>
      </CalendarTopBar>
      {weekMode && (
        <BlogCalendarWeekContainer>
          {weekData.map((day) => (
            <WeekItemContainer
              selected={day.date.isSame(currentDate, "day")}
              key={day.date.toString()}
            >
              <WeekItemDayLabel selected={day.date.isSame(currentDate, "day")}>
                {day.dayLabel}
              </WeekItemDayLabel>
              <WeekItemDayNumber selected={day.date.isSame(currentDate, "day")}>
                {day.dayNumber}
              </WeekItemDayNumber>
            </WeekItemContainer>
          ))}
        </BlogCalendarWeekContainer>
      )}
      <button
        onClick={() => {
          setWeekMode(!weekMode);
        }}
      >
        hi
      </button>
    </BlogCalendarContainer>
  );
};

export default BlogCalendar;
