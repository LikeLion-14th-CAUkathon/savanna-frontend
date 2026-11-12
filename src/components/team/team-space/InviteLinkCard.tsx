import styled from 'styled-components';
import Button from '../../common/Button';
import linkIcon from '../../../assets/icons/team/team-space/link.svg';

interface InviteLinkCardProps {
  inviteUrl: string;
  onCopy: () => void;
}

// B02 초대 링크 카드. 링크는 https:// 를 떼고 보여준다.
export default function InviteLinkCard({ inviteUrl, onCopy }: InviteLinkCardProps) {
  return (
    <Card>
      <Icon src={linkIcon} alt="" />
      <Url>{inviteUrl.replace(/^https?:\/\//i, '')}</Url>
      <CopyButton onClick={onCopy} aria-label="초대 링크 복사">
        복사
      </CopyButton>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px 10px 16px;
  border: 2px solid #e7e5e0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 3px 0 #e2e0da;
`;

// 18px 칸 안에 아이콘을 가운데 둔다.
const Icon = styled.img`
  flex-shrink: 0;
  margin: 0 2.34px;
`;

const Url = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: #1e1e1e;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// 공통 Button(L 52)을 S 크기(32)로 줄여 쓴다.
const CopyButton = styled(Button)`
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
`;
