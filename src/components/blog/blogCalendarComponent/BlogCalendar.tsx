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
  onDayClick: (date: Dayjs) => void;
  uniqueDates?: Dayjs[];
}

interface WeekItemDayLabelProps {
  selected?: boolean;
  hasBlog?: boolean;
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

interface MonthData {
  date: Dayjs;
  dayLabel: string;
  dayNumber: number;
}
export const BlogCalendarContainer = styled.div<CalendarBigContainerProps>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px ${(props) => props.theme.paddingLg}px;
  height: ${(props) => (props.weekMode ? "250px" : "550px")};
  transition: height 0.5s ease;
  align-items: center;
`;

export const BlogCalendarWeekContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
`;

export const WeekItemContainer = styled.div<WeekItemDayLabelProps>`
  border-radius: 40px;
  border: 2px solid
    ${(props) =>
      props.selected || props.hasBlog
        ? props.theme.borderColor
        : "transparent"};
  padding: 8px 4px 0px 4px;
  display: flex;
  //   gap: 4px;
  flex-direction: column;
  align-items: center;
  width: 45px;
  height: 80px;
  justify-content: space-around;
  transition: 0.3s;
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
  transition: 0.3s;
`;

export const MonthItemDayNumber = styled(
  WeekItemDayNumber
)<WeekItemDayLabelProps>`
  background: transparent;
  border: 2px solid
    ${(props) =>
      props.selected || props.hasBlog ? props.theme.text : "transparent"};
`;

export const MonthItemDayNumberInner = styled.div<WeekItemDayLabelProps>`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.selected ? props.theme.text : "transparent")};
  color: ${(props) =>
    props.selected ? props.theme.colorBg : props.theme.text};
  border-radius: 50%;
  transition: 0.3s;
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

export const ExpandButton = styled.button`
  border: none;
  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: ${(props) => props.theme.borderRadius}px;
  padding: ${(props) => props.theme.paddingSmall}px
    ${(props) => props.theme.paddingMed}px;

  transition: 0.3s;
`;

export const BlogCalendarMonthContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 800px;
`;

export const MonthItemContainer = styled.div<WeekItemDayLabelProps>`
  // width: 100%;
  height: 50px;
  border-color: transparent;
  // background: lime;
`;

export const MonthDayLabelContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 800px;
  margin-bottom: 16px;
  justify-items: center;
`;

export const CalendarWrapper = styled.div`
  margin: 16px 0;
`;

export const CalendarButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const BlogCalendar = ({
  currentDate,
  uniqueDates,
  onDayClick,
}: BlogCalendarProps) => {
  const [weekMode, setWeekMode] = useState<boolean>(true);
  const [weekData, setWeekData] = useState<WeekData[]>([]);
  const [monthData, setMonthData] = useState<MonthData[]>([]);
  const [dateState, setDateState] = useState<Dayjs>(currentDate);

  const getWeekData = (inputDate: Dayjs) => {
    const startOfWeek = inputDate.startOf("week");
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

  const getMonthData = (inputDate: Dayjs) => {
    const startOfMonth = inputDate.startOf("month");
    const endOfMonth = inputDate.endOf("month");
    const startDay = startOfMonth.day(); // 0-6, representing Sunday-Saturday
    const daysInMonth = endOfMonth.date();
    const monthDays: MonthData[] = [];
    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    // Add empty slots for days from previous month
    for (let i = 0; i < startDay; i++) {
      monthDays.push({
        date: startOfMonth.subtract(startDay - i, "day"),
        dayLabel: dayLabels[i],
        dayNumber: 0, // Use 0 to indicate empty day
      });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDay = startOfMonth.add(i - 1, "day");
      monthDays.push({
        date: currentDay,
        dayLabel: dayLabels[currentDay.day()],
        dayNumber: i,
      });
    }

    // Fill remaining grid slots if needed
    const remainingDays = (7 - ((startDay + daysInMonth) % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      monthDays.push({
        date: endOfMonth.add(i, "day"),
        dayLabel: dayLabels[(startDay + daysInMonth + i - 1) % 7],
        dayNumber: 0, // Use 0 to indicate empty day
      });
    }

    setMonthData(monthDays);
  };

  const handleDayClick = (day: Dayjs) => {
    onDayClick(day);
    setDateState(day);
  };

  useEffect(() => {
    getWeekData(dateState);
    getMonthData(dateState);
  }, [dateState]);

  useEffect(() => {
    setDateState(currentDate);
  }, [currentDate]);

  return (
    <BlogCalendarContainer weekMode={weekMode}>
      <CalendarTopBar>
        <CalendarArrow
          show={true}
          onClick={() => {
            weekMode
              ? setDateState((prev) => prev.subtract(1, "week"))
              : setDateState((prev) => prev.subtract(1, "month"));
          }}
        >
          <LeftOutlined />
        </CalendarArrow>
        <CalendarTitle>
          {weekMode ? dateState.format("MMMM") : dateState.format("MMMM YYYY")}
        </CalendarTitle>
        <CalendarArrow
          show={true}
          onClick={() => {
            weekMode
              ? setDateState((prev) => prev.add(1, "week"))
              : setDateState((prev) => prev.add(1, "month"));
          }}
        >
          <RightOutlined />
        </CalendarArrow>
      </CalendarTopBar>

      <CalendarWrapper>
        {weekMode ? (
          <BlogCalendarWeekContainer>
            {weekData.map((day) => (
              <WeekItemContainer
                hasBlog={uniqueDates?.some((uniqueDate) =>
                  uniqueDate.isSame(day.date, "day")
                )}
                selected={day.date.isSame(currentDate, "day")}
                key={day.date.toString()}
                onClick={() => {
                  handleDayClick(day.date);
                }}
              >
                <WeekItemDayLabel
                  selected={day.date.isSame(currentDate, "day")}
                >
                  {day.dayLabel}
                </WeekItemDayLabel>
                <WeekItemDayNumber
                  selected={day.date.isSame(currentDate, "day")}
                >
                  {day.dayNumber}
                </WeekItemDayNumber>
              </WeekItemContainer>
            ))}
          </BlogCalendarWeekContainer>
        ) : (
          <>
            <MonthDayLabelContainer>
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <WeekItemDayLabel key={day}>{day}</WeekItemDayLabel>
              ))}
            </MonthDayLabelContainer>
            <BlogCalendarMonthContainer>
              {monthData.map((day, index) => (
                <MonthItemContainer
                  key={index}
                  selected={day.date.isSame(currentDate, "day")}
                  onClick={() => {
                    handleDayClick(day.date);
                  }}
                >
                  {day.dayNumber !== 0 && (
                    <MonthItemDayNumber
                      hasBlog={uniqueDates?.some((uniqueDate) =>
                        uniqueDate.isSame(day.date, "day")
                      )}
                      selected={day.date.isSame(currentDate, "day")}
                    >
                      <MonthItemDayNumberInner
                        selected={day.date.isSame(currentDate, "day")}
                      >
                        {day.dayNumber}
                      </MonthItemDayNumberInner>
                    </MonthItemDayNumber>
                  )}
                </MonthItemContainer>
              ))}
            </BlogCalendarMonthContainer>
          </>
        )}
      </CalendarWrapper>

      <CalendarButtonsContainer>
        <ExpandButton
          onClick={() => {
            setWeekMode(!weekMode);
          }}
        >
          {weekMode ? "Show more" : "Show less"}
        </ExpandButton>
        <ExpandButton
          onClick={() => {
            setDateState(dayjs());
            onDayClick(dayjs());
          }}
        >
          Today
        </ExpandButton>
      </CalendarButtonsContainer>
    </BlogCalendarContainer>
  );
};

export default BlogCalendar;
