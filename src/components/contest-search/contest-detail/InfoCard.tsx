import styled from 'styled-components';

export interface InfoItem {
  label: string;
  value: string;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
}

// '공고 정보'처럼 제목 + (라벨 · 값) 줄로 된 카드
export default function InfoCard({ title, items }: InfoCardProps) {
  return (
    <Card>
      <Title>{title}</Title>
      <InfoRows items={items} />
    </Card>
  );
}

const EMPTY_VALUE_TEXT = '원문에서 확인해 주세요';

// 라벨 · 값 줄 목록. 펼침 카드(ApplicationCard)에서도 쓴다.
// 값이 비어 있으면 '원문에서 확인해 주세요'를 흐리게 보여준다.
export function InfoRows({ items }: { items: InfoItem[] }) {
  return (
    <Rows>
      {items.map((item) => {
        const isEmpty = !item.value || item.value.trim() === '';
        return (
          <Row key={item.label}>
            <dt>{item.label}</dt>
            <Value $empty={isEmpty}>{isEmpty ? EMPTY_VALUE_TEXT : item.value}</Value>
          </Row>
        );
      })}
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

const Value = styled.dd<{ $empty: boolean }>`
  flex: 1;
  min-width: 0;
  margin: 0;
  color: ${({ $empty }) => ($empty ? '#999896' : '#1e1e1e')};
  font-size: 15px;
`;
