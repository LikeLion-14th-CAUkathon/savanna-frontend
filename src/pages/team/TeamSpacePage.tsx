import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import TabBar, { type TabId } from '../../components/layout/TabBar';
import TeamAvatar from '../../components/common/TeamAvatar';
import Button from '../../components/common/Button';
import MemberTile from '../../components/common/MemberTile';
import Toast from '../../components/toast/Toast';
import TeamProjectCard from '../../components/team/team-space/TeamProjectCard';
import InviteLinkCard from '../../components/team/team-space/InviteLinkCard';
import { characters } from '../../components/onboarding/profileOptions';
import { MOCK_TEAM_SPACE } from '../../mocks/team';
import headerImage from '../../assets/images/team/team-space-header.webp';
import { MOCK_RECEIVED_PROPOSALS, MOCK_SENT_PROPOSALS } from '../../mocks/teamNews';
import { getTeamNewsNotification } from '../../utils/teamNews';
import mailIcon from '../../assets/icons/team/team-space/mail.svg';
import newDotIcon from '../../assets/icons/team/team-space/new-dot.svg';

const TILE_TONES = ['peach', 'mint', 'coral'] as const;

const COPY_TOAST = {
  copied: { variant: 'success', message: '초대 링크를 복사했어요.' },
  'copy-error': { variant: 'error', message: '링크를 복사하지 못했어요. 다시 시도해 주세요.' },
} as const;

type CopyToast = keyof typeof COPY_TOAST;

// B02 팀 공간
export default function TeamSpacePage() {
  const navigate = useNavigate();
  // TODO: API 연결 시 getTeamDetail(teamId) · 초대 링크 응답으로 교체
  const { team, myUserId, inviteUrl, memberCharacterIds } = MOCK_TEAM_SPACE;
  // 새 제안 또는 내가 보낸 제안의 새 응답 · 응답 변경이 있을 때만 알림 점을 띄운다.
  const hasNewTeamNews = getTeamNewsNotification(MOCK_RECEIVED_PROPOSALS, MOCK_SENT_PROPOSALS).hasUnread;

  // 팀원은 항상 동물 캐릭터를 가진다(고르지 않으면 가입 시 자동 배정).
  // 혹시 값이 없거나 모르는 id면 깨진 이미지 대신 첫 번째 캐릭터를 보여준다.
  const getCharacterImage = (userId: number) =>
    (characters.find((character) => character.id === memberCharacterIds[userId]) ?? characters[0]).image;

  // id: 같은 토스트가 연달아 떠도 새로 그려서 타이머를 다시 시작한다.
  const [toastState, setToastState] = useState<{ type: CopyToast; id: number } | null>(null);
  const toast = toastState ? COPY_TOAST[toastState.type] : null;
  const showToast = (type: CopyToast) => setToastState((prev) => ({ type, id: (prev?.id ?? 0) + 1 }));
  const closeToast = useCallback(() => setToastState(null), []);

  const copyInviteLink = () => {
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => showToast('copied'))
      .catch(() => showToast('copy-error'));
  };

  const handleTabChange = (tab: TabId) => {
    if (tab === 'oasis') navigate('/oasis');
    if (tab === 'search') navigate('/contest');
    if (tab === 'mypage') navigate('/mypage');
  };

  // 나를 맨 앞에 둔다.
  const members = [...team.members].sort(
    (a, b) => Number(b.userId === myUserId) - Number(a.userId === myUserId),
  );

  return (
    <Page>
      <HeaderBand>
        <Title>팀 공간</Title>
        <Profile>
          <TeamAvatar teamName={team.name} />
          <TeamName>{team.name}</TeamName>
          <MemberCount>팀원 {team.members.length}명</MemberCount>
          <Actions>
            {/* TODO: B02 팀 정보 수정 화면 연결 */}
            <ActionButton variant="secondary">정보 수정</ActionButton>
            <NewsButtonWrap>
              <ActionButton
                variant="secondary"
                onClick={() => navigate('/team/news')}
                aria-label={hasNewTeamNews ? '팀 소식, 새 소식 있음' : '팀 소식'}
              >
                <img src={mailIcon} alt="" />
                팀 소식
              </ActionButton>
              {hasNewTeamNews && <NewDot src={newDotIcon} alt="" />}
            </NewsButtonWrap>
          </Actions>
        </Profile>
      </HeaderBand>

      <Sheet>
        <Grabber aria-hidden="true" />

        <Section>
          <SectionTitle>우리 팀 프로젝트</SectionTitle>
          <TeamProjectCard team={team} />
        </Section>

        <Section>
          <SectionTitle>
            함께하는 사자들 <Count>{team.members.length}명</Count>
          </SectionTitle>
          <MemberList>
            {members.map((member, index) => (
              <li key={member.userId}>
                <MemberTile
                  name={member.name}
                  isMe={member.userId === myUserId}
                  tone={TILE_TONES[index % TILE_TONES.length]}
                  characterImage={getCharacterImage(member.userId)}
                />
              </li>
            ))}
          </MemberList>
        </Section>

        <Section $gap={10}>
          <SectionTitle>초대 링크</SectionTitle>
          <Description>팀원 누구나 같은 링크로 초대할 수 있어요.</Description>
          <InviteLinkCard inviteUrl={inviteUrl} onCopy={copyInviteLink} />
        </Section>
      </Sheet>

      <BottomBar>
        <TabBar activeTab="team" onTabChange={handleTabChange} hasNew={hasNewTeamNews} />
      </BottomBar>

      {toastState && toast && (
        <ToastArea>
          <Toast key={toastState.id} variant={toast.variant} onClose={closeToast}>
            {toast.message}
          </Toast>
        </ToastArea>
      )}
    </Page>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 402px;
  max-width: 100%;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;
`;

// 배경 그림 위에 제목 · 팀 프로필. 아래 시트가 32px 겹쳐 올라온다.
const HeaderBand = styled.header`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: -32px;
  padding-bottom: 56px;
  overflow: hidden;
  border-radius: 0 0 28px 28px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url(${headerImage}) top center / 100% auto no-repeat;
    opacity: 0.8;
    pointer-events: none;
  }

  & > * {
    position: relative;
  }
`;

// 앱 바 자리(56px). 탭 화면이라 뒤로 가기 버튼 없이 제목만 둔다.
const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 56px;
  margin: 0;
  color: #3b2a16;
  font-size: 22px;
  font-weight: 700;
`;

const Profile = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 4px 24px 0;
`;

const TeamName = styled.h2`
  margin: 10px 0 0;
  color: #3b2a16;
  font-family: 'CookieRun', sans-serif;
  font-size: 28px;
  font-weight: 400;
  line-height: 1.25;
  letter-spacing: -0.28px;
  text-align: center;
`;

const MemberCount = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  width: 100%;
  margin-top: 18px;
`;

// 공통 Button(L 52)을 M 크기(44)로 줄여 쓴다.
const ActionButton = styled(Button)`
  gap: 4px;
  width: 160px;
  height: 44px;
  padding: 0 16px;
  font-size: 14px;
  box-shadow: 0 3px 0 #e2e0da;
`;

const NewsButtonWrap = styled.div`
  position: relative;
`;

const NewDot = styled.img`
  position: absolute;
  top: 0;
  right: -2px;
  pointer-events: none;
`;

const Sheet = styled.main`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  padding: 12px 24px 32px;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
`;

const Grabber = styled.div`
  align-self: center;
  width: 40px;
  height: 5px;
  margin-bottom: 24px;
  border-radius: 2.5px;
  background: #e7e5e0;
`;

const Section = styled.section<{ $gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 12 }) => $gap}px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  color: #1e1e1e;
  font-size: 17px;
  font-weight: 700;
`;

const Count = styled.span`
  margin-left: 2px;
  color: #d97700;
`;

const Description = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 13px;
  font-weight: 400;
`;

// 팀원이 많으면 옆으로 넘겨 본다. 화면 끝까지 이어지도록 좌우 여백을 상쇄한다.
const MemberList = styled.ul`
  display: flex;
  gap: 10px;
  margin: 0 -24px;
  padding: 0 24px 4px;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BottomBar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 5;
`;

// 탭 바(75px) 위 16px
const ToastArea = styled.div`
  position: fixed;
  bottom: calc(75px + 16px);
  left: 50%;
  z-index: 102;
  width: 354px;
  max-width: calc(100% - 48px);
  transform: translateX(-50%);
`;
