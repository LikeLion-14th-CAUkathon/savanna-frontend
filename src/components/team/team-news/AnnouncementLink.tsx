import styled from 'styled-components';
import chevronRightIcon from '../../../assets/icons/team/team-news/chevron-right.svg';

interface AnnouncementLinkProps {
  title: string; // 공고 이름
  description: string; // 예) 'AI 수면 습관 코치 프로젝트 · 마감 D-5'
  onClick: () => void;
  className?: string;
}

// 제안한 공고 한 줄. 누르면 공고 상세로 이동한다.
export default function AnnouncementLink({ title, description, onClick, className }: AnnouncementLinkProps) {
  return (
    <LinkButton type="button" onClick={onClick} className={className}>
      <Texts>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Texts>
      <IconBox>
        <img src={chevronRightIcon} alt="" />
      </IconBox>
    </LinkButton>
  );
}

const LinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  text-align: left;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Texts = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.span`
  overflow: hidden;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Description = styled.span`
  overflow: hidden;
  color: #999896;
  font-size: 13px;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const IconBox = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
`;
