import { useState, SyntheticEvent, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { selectMemberState, todayState, IInquiryPeriodState } from 'states';
import dayjs from 'dayjs';
import { useClickAway } from 'react-use';

import { BTN_OPTIONS, Month, TPage, findRegistrationDate, dateInputValue, onClickQuickBtn, TStates } from './_shared';
import { ArrowDown, CalendarIcon } from 'assets/svgs';
import styles from './datePicker.module.scss';
import cn from 'classnames';
import { getActiveBtn } from 'utils/getActiveBtn';

interface Props {
  isSubmit?: boolean;
  page: TPage;
  state: TStates;
}

const DatePicker = ({ isSubmit, page, state }: Props) => {
  const selectedMember = useRecoilValue(selectMemberState);
  const fixedToday = useRecoilValue(todayState);
  const registrationDate = findRegistrationDate(page, selectedMember.crt_ymdt);

  const [getTime, setTime] = useState(dayjs(fixedToday));
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [inquiryPeriod, setInquiryPeriod] = useRecoilState<IInquiryPeriodState>(state);
  const { startDate, endDate } = inquiryPeriod;
  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsOpenCalendar(false);
  });

  const nextMonth = getTime.add(1, 'month');

  const MONTHS = [
    { isCurrentMonth: true, assignedDay: getTime },
    { isCurrentMonth: false, assignedDay: nextMonth },
  ];

  const onClickDateRange = () => setIsOpenCalendar(!isOpenCalendar);

  const onMonthBtnClick = ({ currentTarget }: SyntheticEvent<EventTarget>) => {
    if (!(currentTarget instanceof HTMLButtonElement)) return;
    const { name } = currentTarget.dataset;
    name === 'nextMonth' ? setTime(getTime.add(1, 'month')) : setTime(getTime.subtract(1, 'month'));
  };

  const onClick3TypesOfQuickBtn = (e: SyntheticEvent<EventTarget>) =>
    onClickQuickBtn(e, setInquiryPeriod, fixedToday, registrationDate);

  return (
    <fieldset className={styles.wrapper}>
      <div className={cn(styles.optionsWrapper, { [styles.invalidated]: isSubmit && (!startDate || !endDate) })}>
        <button
          type='button'
          className={cn(styles.dateInputWrapper, {
            [styles.active]: isOpenCalendar,
          })}
          onClick={onClickDateRange}
        >
          <CalendarIcon className={styles.calendarIcon} />
          {[startDate, endDate].map((date, idx) => {
            return (
              <input
                key={`date-input-${idx + 1}`}
                className={styles.dateInput}
                type='text'
                readOnly
                value={dateInputValue(date, idx)}
                required
                aria-required='true'
                pattern='\d{4}-\d{2}-\d{2}'
                placeholder={idx ? '종료일' : '시작일'}
              />
            );
          })}
          <ArrowDown className={styles.arrowDown} />
        </button>
      </div>
      {isOpenCalendar && (
        <div className={styles.monthsWrapper} ref={ref}>
          <div className={styles.monthsCalendar}>
            {MONTHS.map((month, idx) => (
              <Month
                key={`monthCalendar-${idx + 1}`}
                assignedDay={month.assignedDay}
                onMonthBtnClick={onMonthBtnClick}
                isCurrentMonth={month.isCurrentMonth}
                setIsOpenCalendar={setIsOpenCalendar}
                inquiryPeriod={inquiryPeriod}
                setInquiryPeriod={setInquiryPeriod}
              />
            ))}
          </div>
          <div className={styles.monthsButton}>
            {BTN_OPTIONS.map((option, index) => {
              const active = getActiveBtn(option, fixedToday, registrationDate, startDate, endDate);
              return (
                <button
                  key={option}
                  type='button'
                  className={cn(styles.btn, { [styles.clickedButton]: active })}
                  onClick={onClick3TypesOfQuickBtn}
                  data-name={option}
                  value={index}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </fieldset>
  );
};

export default DatePicker;
