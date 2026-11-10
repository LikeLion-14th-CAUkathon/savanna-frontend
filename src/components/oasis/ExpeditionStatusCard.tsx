import styled from 'styled-components';
import membersIcon from '../../assets/icons/oasis/status-members.png';
import expeditionIcon from '../../assets/icons/oasis/status-expedition.png';
import deadlineIcon from '../../assets/icons/oasis/status-deadline.png';

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
    { label: '팀원', value: memberCount ?? EMPTY, icon: membersIcon, highlight: false },
    { label: '진행 중 원정', value: expeditionCount ?? EMPTY, icon: expeditionIcon, highlight: false },
    { label: '다음 접수 마감', value: nextDeadline ?? EMPTY, icon: deadlineIcon, highlight: true },
  ];

  return (
    <Card aria-label="원정 현황">
      {items.map((item) => (
        <Item key={item.label}>
          <IconBox>
            <IconImage src={item.icon} alt="" />
          </IconBox>
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
  justify-content: space-between;
  box-sizing: border-box;
  width: 354px;
  max-width: 100%;
  height: 56px;
  padding: 10px 20px;
  border-radius: 26px;
  background: rgba(255, 249, 236, 0.9);
  box-shadow: var(--shadow-float), 0 2px 0 var(--color-sand);
  overflow: hidden;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

// 일러스트 여백이 넓어서 145%로 키운 뒤 34px 상자에 맞춰 자름 (Figma 기준)
const IconBox = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  overflow: hidden;
`;

const IconImage = styled.img`
  position: absolute;
  top: -22.73%;
  left: -22.73%;
  width: 145.45%;
  height: 145.45%;
  max-width: none;
`;

const Texts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
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
