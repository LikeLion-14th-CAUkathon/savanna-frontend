import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import TabBar from '../../components/layout/TabBar';
import TeamAvatar from '../../components/common/TeamAvatar';
import Button from '../../components/common/Button';
import MemberTile from '../../components/common/MemberTile';
import Toast from '../../components/toast/Toast';
import TeamProjectCard from '../../components/team/team-space/TeamProjectCard';
import InviteLinkCard from '../../components/team/team-space/InviteLinkCard';
import {
  fetchInviteUrl,
  fetchTeamSpace,
  type TeamSpaceData,
} from '../../components/team/team-space/teamSpaceData';
import { characters } from '../../components/onboarding/profileOptions';
import { getProposalNotifications } from '../../api/proposal';
import type { TeamSpaceLocationState } from '../../types/team';
import headerImage from '../../assets/images/team/team-space-header.webp';
import mailIcon from '../../assets/icons/team/team-space/mail.svg';
import newDotIcon from '../../assets/icons/team/team-space/new-dot.svg';

const TILE_TONES = ['peach', 'mint', 'coral'] as const;

type ToastState = { variant: 'success' | 'error'; message: string; id: number };

type LoadState =
  | { type: 'loading' }
  | { type: 'success'; data: TeamSpaceData }
  | { type: 'no-team' }
  | { type: 'error'; message: string; canRetry: boolean };

// 불러오기 실패 안내. 403은 팀에 소속되지 않음, 404는 없는 팀이라 다시 시도해도 같다.
const toLoadError = (error: unknown): LoadState => {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  if (status === 403) return { type: 'error', message: '이 팀에 소속되어 있지 않아요.', canRetry: false };
  if (status === 404) return { type: 'error', message: '팀을 찾을 수 없어요.', canRetry: false };
  return { type: 'error', message: '팀 정보를 불러오지 못했어요.', canRetry: true };
};

// 캐릭터를 고르지 않았거나(null) 모르는 번호면 깨진 이미지 대신 첫 번째 캐릭터
const getCharacterImage = (apiId: number | null) =>
  (characters.find((character) => character.apiId === apiId) ?? characters[0]).image;

// B02 팀 공간. 주소의 teamId가 바뀌면 새로 불러오도록 key로 다시 그린다.
export default function TeamSpacePage() {
  const { search } = useLocation();
  return <TeamSpaceContent key={search} search={search} />;
}

function TeamSpaceContent({ search }: { search: string }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== 토스트 =====
  // id: 같은 토스트가 연달아 떠도 새로 그려서 타이머를 다시 시작한다.
  // B01 · 팀 정보 수정에서 사진 업로드만 실패하고 넘어왔으면 처음에 그 안내를 띄운다.
  const [toastState, setToastState] = useState<ToastState | null>(() => {
    const { photoError } = (location.state as TeamSpaceLocationState | null) ?? {};
    return photoError ? { variant: 'error', message: photoError, id: 1 } : null;
  });
  const showToast = (variant: ToastState['variant'], message: string) =>
    setToastState((prev) => ({ variant, message, id: (prev?.id ?? 0) + 1 }));
  const closeToast = useCallback(() => setToastState(null), []);

  // 안내는 한 번만. 새로고침 · 뒤로가기로 다시 오면 뜨지 않도록 기록의 state를 비운다.
  useEffect(() => {
    if (location.state) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location, navigate]);

  // ===== 팀 · 팀원 =====
  const [loadState, setLoadState] = useState<LoadState>({ type: 'loading' });

  const loadTeam = useCallback(() => {
    fetchTeamSpace(search)
      .then((data) => setLoadState(data ? { type: 'success', data } : { type: 'no-team' }))
      .catch((error: unknown) => setLoadState(toLoadError(error)));
  }, [search]);

  useEffect(() => {
    loadTeam();
  }, [loadTeam]);

  const retryLoad = () => {
    setLoadState({ type: 'loading' });
    loadTeam();
  };

  const data = loadState.type === 'success' ? loadState.data : null;
  const teamId = data?.team.teamId;

  // ===== 초대 링크 (팀을 불러온 뒤) =====
  const [invite, setInvite] = useState<{ teamId: number; url: string | null; failed: boolean } | null>(null);
  useEffect(() => {
    if (teamId === undefined) return;
    let ignore = false;
    fetchInviteUrl(teamId)
      .then((url) => {
        if (!ignore) setInvite({ teamId, url, failed: false });
      })
      .catch(() => {
        if (!ignore) setInvite({ teamId, url: null, failed: true });
      });
    return () => {
      ignore = true;
    };
  }, [teamId]);
  const inviteUrl = invite && invite.teamId === teamId ? invite.url : null;
  const invitePlaceholder = invite?.failed ? '초대 링크를 만들지 못했어요.' : '초대 링크를 만들고 있어요.';

  // ===== 팀 소식 알림 점 =====
  // 새 제안 또는 내가 보낸 제안의 새 응답 · 응답 변경이 있을 때만 점을 띄운다. (서버가 계산) 못 불러오면 숨긴다.
  const [hasNewTeamNews, setHasNewTeamNews] = useState(false);
  useEffect(() => {
    let ignore = false;
    getProposalNotifications()
      .then(({ hasUnread }) => {
        if (!ignore) setHasNewTeamNews(hasUnread);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const copyInviteLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard
      .writeText(inviteUrl)
      .then(() => showToast('success', '초대 링크를 복사했어요.'))
      .catch(() => showToast('error', '링크를 복사하지 못했어요. 다시 시도해 주세요.'));
  };

  const bottomBar = (
    <BottomBar>
      <TabBar activeTab="team" hasNew={hasNewTeamNews} />
    </BottomBar>
  );

  if (!data) {
    return (
      <Page>
        <StatusBox role={loadState.type === 'loading' ? 'status' : 'alert'}>
          {loadState.type === 'loading' && <StatusMessage>팀 정보를 불러오고 있어요.</StatusMessage>}
          {loadState.type === 'no-team' && (
            <>
              <StatusMessage>아직 소속된 팀이 없어요.</StatusMessage>
              <Button onClick={() => navigate('/team/create')}>팀 만들기</Button>
            </>
          )}
          {loadState.type === 'error' && (
            <>
              <StatusMessage>{loadState.message}</StatusMessage>
              {loadState.canRetry && (
                <Button variant="secondary" onClick={retryLoad}>
                  다시 시도
                </Button>
              )}
            </>
          )}
        </StatusBox>
        {bottomBar}
      </Page>
    );
  }

  const { team, myUserId } = data;

  // 팀 정보 수정으로 간다. 팀 정보 · 사진은 수정 화면이 teamId로 다시 불러온다.
  const openEdit = () => navigate(`/team/edit?teamId=${team.teamId}`);

  // 나를 맨 앞에 둔다.
  const members = [...team.members].sort(
    (a, b) => Number(b.userId === myUserId) - Number(a.userId === myUserId),
  );

  return (
    <Page>
      <HeaderBand>
        <Title>팀 공간</Title>
        <Profile>
          <TeamAvatar teamName={team.name} photoUrl={team.photoUrl} />
          <TeamName>{team.name}</TeamName>
          <MemberCount>팀원 {team.members.length}명</MemberCount>
          <Actions>
            <ActionButton variant="secondary" onClick={openEdit}>
              정보 수정
            </ActionButton>
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
                  characterImage={getCharacterImage(member.characterId)}
                />
              </li>
            ))}
          </MemberList>
        </Section>

        <Section $gap={10}>
          <SectionTitle>초대 링크</SectionTitle>
          <Description>팀원 누구나 같은 링크로 초대할 수 있어요.</Description>
          <InviteLinkCard inviteUrl={inviteUrl} placeholder={invitePlaceholder} onCopy={copyInviteLink} />
        </Section>
      </Sheet>

      {bottomBar}

      {toastState && (
        <ToastArea>
          <Toast key={toastState.id} variant={toastState.variant} onClose={closeToast}>
            {toastState.message}
          </Toast>
        </ToastArea>
      )}
    </Page>
  );
}

// 불러오는 중 · 팀 없음 · 실패 안내. 탭바를 아래에 두도록 남은 높이를 채운다.
const StatusBox = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 24px 40px;
`;

const StatusMessage = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 15px;
  text-align: center;
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: #fafaf8;
  color: #1e1e1e;
  font-family: 'Pretendard', sans-serif;
  line-height: normal;
  letter-spacing: 0;
  text-align: left;

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }

  /* 태블릿·노트북에서는 가운데 폰 화면 프레임 안에서 스크롤한다. */
  @media (min-width: 481px) {
    height: 100%;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;

    /* 내용이 프레임보다 길면 헤더 등이 눌려 줄어들지 않고 스크롤되게 한다. */
    & > * {
      flex-shrink: 0;
    }

    &::-webkit-scrollbar {
      display: none;
    }
  }
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
  padding: 40px 24px 32px;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  box-shadow: 0 -5px 22px rgba(59, 42, 22, 0.17);
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
  width: calc(100% - 48px);
  max-width: 354px;
  transform: translateX(-50%);

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
`;
