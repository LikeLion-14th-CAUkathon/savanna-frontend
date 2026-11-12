import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { TeamInfo } from '../../../api/team';
import externalLinkIcon from '../../../assets/icons/team/team-space/external-link.svg';

interface TeamProjectCardProps {
  team: TeamInfo;
}

// 화면에는 https:// 를 떼고 보여준다. 예) https://github.com/a → github.com/a
const toDisplayUrl = (url: string) => url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

// B02 '우리 팀 프로젝트' 카드. 비어 있는 선택 항목(링크 · 기술 스택)은 줄을 숨긴다.
export default function TeamProjectCard({ team }: TeamProjectCardProps) {
  const stacks = (team.stack ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <Card>
      <Row label="프로젝트">
        <Value $bold>{team.projectName}</Value>
      </Row>
      <Row label="소개">
        <Value>{team.projectIntro}</Value>
      </Row>
      {team.githubUrl && (
        <Row label="깃허브">
          <LinkValue url={team.githubUrl} />
        </Row>
      )}
      {team.presentationUrl && (
        <Row label="발표자료">
          <LinkValue url={team.presentationUrl} />
        </Row>
      )}
      {stacks.length > 0 && (
        <Row label="기술 스택">
          <Tags>
            {stacks.map((stack) => (
              <Tag key={stack}>{stack}</Tag>
            ))}
          </Tags>
        </Row>
      )}
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <RowBox>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </RowBox>
  );
}

// 링크 줄 전체를 눌러 새 창으로 연다.
function LinkValue({ url }: { url: string }) {
  return (
    <Link href={url} target="_blank" rel="noopener noreferrer">
      <span>{toDisplayUrl(url)}</span>
      <img src={externalLinkIcon} alt="" />
    </Link>
  );
}

const Card = styled.dl`
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 4px 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

const RowBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 0;
  word-break: keep-all;

  & + & {
    border-top: 1.5px solid #e7e5e0;
  }

  dt {
    flex-shrink: 0;
    width: 64px;
    padding-top: 2px;
    color: #999896;
    font-size: 12px;
    font-weight: 400;
  }

  dd {
    flex: 1;
    min-width: 0;
    margin: 0;
  }
`;

const Value = styled.p<{ $bold?: boolean }>`
  margin: 0;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: ${({ $bold }) => ($bold ? 700 : 400)};
`;

const Link = styled.a`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #3a7a2e;
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;

  span {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  img {
    flex-shrink: 0;
  }

  &:focus-visible {
    outline: 2px solid #3a7a2e;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tag = styled.span`
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f0ec;
  color: #5b5b5b;
  font-size: 12px;
  font-weight: 700;
`;
