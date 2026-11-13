import styled from 'styled-components';
import { filledItems, type InfoItem } from './infoItems';

interface InfoCardProps {
  title: string;
  items: InfoItem[];
}

// '공고 정보'처럼 제목 + (라벨 · 값) 줄로 된 카드. 보여줄 값이 하나도 없으면 카드째 숨긴다.
export default function InfoCard({ title, items }: InfoCardProps) {
  if (filledItems(items).length === 0) return null;

  return (
    <Card>
      <Title>{title}</Title>
      <InfoRows items={items} />
    </Card>
  );
}

// 라벨 · 값 줄 목록. 펼침 카드(ApplicationCard)에서도 쓴다. 값이 비어 있는 줄은 그리지 않는다.
export function InfoRows({ items }: { items: InfoItem[] }) {
  return (
    <Rows>
      {filledItems(items).map((item) => (
        <Row key={item.label}>
          <dt>{item.label}</dt>
          <Value>{item.value}</Value>
        </Row>
      ))}
    </Rows>
  );
}

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const Title = styled.h2`
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
`;

const Rows = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 2px 0;
  font-weight: 500;
  word-break: keep-all;

  dt {
    flex-shrink: 0;
    width: 64px;
    color: #999896;
    font-size: 13px;
  }
`;

const Value = styled.dd`
  flex: 1;
  min-width: 0;
  margin: 0;
  color: #1e1e1e;
  font-size: 15px;
`;
