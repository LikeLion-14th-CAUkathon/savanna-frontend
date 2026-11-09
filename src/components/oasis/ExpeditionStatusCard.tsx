import styled from 'styled-components';
import membersIcon from '../../assets/icons/oasis/status-members.svg';
import expeditionIcon from '../../assets/icons/oasis/status-expedition.svg';
import deadlineIcon from '../../assets/icons/oasis/status-deadline.svg';

// 값이 없으면(불러오는 중·실패) '-'로 표시
interface ExpeditionStatusCardProps {
  memberCount?: number;
  expeditionCount?: number;  // 진행 중 원정 수
  nextDeadline?: string;     // 'D-5'처럼 보여줄 문구
}

const EMPTY = '-';

export default function ExpeditionStatusCard({
  memberCount,
  expeditionCount,
  nextDeadline,
}: ExpeditionStatusCardProps) {
  const items = [
    { label: '팀원', value: memberCount ?? EMPTY, icon: membersIcon, iconBg: '#fff0cc', highlight: false },
    { label: '진행 중 원정', value: expeditionCount ?? EMPTY, icon: expeditionIcon, iconBg: '#eef5e6', highlight: false },
    { label: '다음 접수 마감', value: nextDeadline ?? EMPTY, icon: deadlineIcon, iconBg: '#fff6dd', highlight: true },
  ];

  return (
    <Card aria-label="원정 현황">
      {items.map((item) => (
        <Item key={item.label}>
          <IconCircle $bg={item.iconBg}>
            <img src={item.icon} alt="" />
          </IconCircle>
          <Texts>
            <Value $highlight={item.highlight}>{item.value}</Value>
            <Label>{item.label}</Label>
          </Texts>
        </Item>
      ))}
    </Card>
  );
}

const Card = styled.section`
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 354px;
  max-width: 100%;
  height: 56px;
  padding: 10px;
  border-radius: 26px;
  background: rgba(255, 249, 236, 0.9);
  box-shadow: var(--shadow-float), 0 2px 0 var(--color-sand);
  overflow: hidden;
`;

const Item = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const IconCircle = styled.span<{ $bg: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: ${({ $bg }) => $bg};
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: normal;
  white-space: nowrap;
`;

const Value = styled.p<{ $highlight: boolean }>`
  color: ${({ $highlight }) => ($highlight ? 'var(--color-orange)' : 'var(--color-brown)')};
  font-size: 17px;
  font-weight: 700;
`;

const Label = styled.p`
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 500;
`;
