import styled from 'styled-components';
import type { ContestPhase } from './contestPhase';
import lionIcon from '../../../assets/icons/contest-search/contest-detail/lion.svg';
import { diffCalendarDays, formatMonthDay, formatMonthDayWeekday, formatTime } from '../../../utils/date';

interface ScheduleCardProps {
  phase: ContestPhase;
  startAt: Date;
  deadlineAt: Date;
  today: Date;
}

// 접수 일정 카드: 남은 일수 + 진행 막대(오늘 위치에 사자) + 시작/오늘/마감 날짜
export default function ScheduleCard({ phase, startAt, deadlineAt, today }: ScheduleCardProps) {
  const daysLeft = diffCalendarDays(today, deadlineAt);
  const totalDays = diffCalendarDays(startAt, deadlineAt);
  const elapsedDays = diffCalendarDays(startAt, today);

  // 진행 비율 (0 ~ 1). 마감이면 꽉 채우고, 접수 전이면 0.
  const progress =
    phase === 'closed' ? 1 : phase === 'upcoming' ? 0 : clamp(elapsedDays / Math.max(totalDays, 1));

  const remainLabel = {
    open: daysLeft > 0 ? `${daysLeft}일 남음` : '오늘 마감',
    upcoming: '접수 예정',
    closed: '마감',
  }[phase];

  return (
    <Card>
      <TopRow>
        <TitleGroup>
          <strong>접수 일정</strong>
          <span>
            · {formatMonthDayWeekday(deadlineAt)} {formatTime(deadlineAt)} 마감 (KST)
          </span>
        </TitleGroup>
        <Remain $highlight={phase === 'open'}>{remainLabel}</Remain>
      </TopRow>

      <Progress
        role="progressbar"
        aria-label="접수 진행"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <Track />
        <Elapsed $closed={phase === 'closed'} style={{ width: `${progress * 100}%` }} />
        {phase === 'open' && (
          <Lion
            src={lionIcon}
            alt=""
            style={{ left: `calc(${progress * 100}% - ${LION_CENTER_X}px)` }}
          />
        )}
      </Progress>

      <Dates>
        <span>{formatMonthDayWeekday(startAt)} 시작</span>
        {phase === 'open' && <Today>오늘 {formatMonthDay(today)}</Today>}
        <span>{formatMonthDayWeekday(deadlineAt)} 마감</span>
      </Dates>
    </Card>
  );
}

// lion.svg(23 × 26) 안에서 사자 몸 중심의 x 좌표. 이 점이 진행 막대 끝에 오도록 맞춘다.
const LION_CENTER_X = 11.37;

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  white-space: nowrap;
`;

const TitleGroup = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  strong {
    color: #1e1e1e;
    font-size: 15px;
    font-weight: 700;
  }

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    color: #5b5b5b;
    font-size: 13px;
    font-weight: 400;
  }
`;

const Remain = styled.span<{ $highlight: boolean }>`
  flex-shrink: 0;
  color: ${({ $highlight }) => ($highlight ? '#d97700' : '#999896')};
  font-family: 'CookieRun', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.18px;
`;

const Progress = styled.div`
  position: relative;
  height: 30px;
`;

const Track = styled.div`
  position: absolute;
  top: 20px;
  left: 0;
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #f1f0ec;
`;

const Elapsed = styled.div<{ $closed: boolean }>`
  position: absolute;
  top: 20px;
  left: 0;
  height: 8px;
  border-radius: 4px;
  background: ${({ $closed }) => ($closed ? '#d7d4cd' : '#ffb72b')};
`;

// 오늘 위치를 표시하는 사자
const Lion = styled.img`
  position: absolute;
  top: 0;
  display: block;
  max-width: none;
`;

const Dates = styled.div`
  display: flex;
  justify-content: space-between;
  color: #999896;
  font-size: 12px;
  font-weight: 400;
  white-space: nowrap;
`;

const Today = styled.span`
  color: #5b5b5b;
  font-weight: 700;
`;
