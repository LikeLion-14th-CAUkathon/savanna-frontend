import { useId, useState } from 'react';
import styled from 'styled-components';
import { InfoRows } from './InfoCard';
import type { ContestDetail } from '../../../types/contest';
import chevronIcon from '../../../assets/icons/contest-search/contest-detail/chevron-down.svg';

interface ApplicationCardProps {
  application: ContestDetail['application'];
}

// '지원 방법·제출물' 펼침 카드. 처음엔 접혀 있다.
export default function ApplicationCard({ application }: ApplicationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  const items = [
    { label: '지원 방법', value: application.method },
    { label: '제출물', value: application.submissions.join(', ') },
    { label: '양식', value: application.form },
    { label: '동의서', value: application.consent },
  ];

  return (
    <Card $open={isOpen}>
      <Header
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <Title>지원 방법·제출물</Title>
        <Hint>{isOpen ? '접기' : `제출물 ${application.submissions.length}개`}</Hint>
        <Chevron src={chevronIcon} alt="" $open={isOpen} />
      </Header>

      {isOpen && (
        <Content id={contentId}>
          <Divider />
          <InfoRows items={items} />
        </Content>
      )}
    </Card>
  );
}

const Card = styled.section<{ $open: boolean }>`
  padding: ${({ $open }) => ($open ? '16px 18px 18px' : '16px 18px')};
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const Header = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 4px;
    border-radius: 4px;
  }
`;

const Title = styled.span`
  flex: 1;
  min-width: 0;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
`;

const Hint = styled.span`
  flex-shrink: 0;
  color: #999896;
  font-size: 13px;
  font-weight: 400;
`;

const Chevron = styled.img<{ $open: boolean }>`
  flex-shrink: 0;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'none')};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
`;

const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: #e7e5e0;
`;
