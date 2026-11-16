import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { isAxiosError } from 'axios';
import styled from 'styled-components';
import { getApiErrorMessage } from '../../api/client';
import { acceptInvitation, previewInvitation } from '../../api/invitation';
import type { InvitationPreviewResponse } from '../../api/invitation';
import { getMyTeams } from '../../api/team';
import { getMyInfo } from '../../api/user';
import AppBar from '../../components/layout/AppBar';
import Button from '../../components/common/Button';
import Toast from '../../components/toast/Toast';
import InviteInfoField from '../../components/onboarding/InviteInfoField';
import { characters } from '../../components/onboarding/profileOptions';
import { toCharacterId } from '../../utils/character';
import headerImage from '../../assets/images/background/invite-header.webp';

// 서버 캐릭터 번호(1~9)에 맞는 동물 이미지. 미설정이면 undefined
const characterImage = (apiId: number | null) =>
  characters.find((character) => character.id === toCharacterId(apiId))?.image;

// A03 초대 확인·팀 합류
export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  return <InvitationGate key={token} token={token} />;
}

function InvitationGate({ token }: { token: string | undefined }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [myCharacterId, setMyCharacterId] = useState<number | null>(null);
  const authRequest = useRef<ReturnType<typeof getMyInfo> | null>(null);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    // 쿠키로 로그인 상태를 복원한 뒤 초대 화면을 표시한다.
    authRequest.current ??= getMyInfo();
    authRequest.current.then((me) => {
      if (controller.signal.aborted) return;
      // 참여 현황의 내 프로필에 쓸 캐릭터
      setMyCharacterId(me.characterId);
      setStatus('ready');
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      const code = isAxiosError(error) ? error.response?.status : undefined;
      if (code === 401 || code === 403) {
        sessionStorage.setItem('invitationReturnUrl', location.pathname + location.search + location.hash);
        navigate('/login', { replace: true });
      } else {
        setStatus('error');
      }
    });
    return () => controller.abort();
  }, [token, location.pathname, location.search, location.hash, navigate]);

  if (!token || status === 'ready') return <InvitationContent token={token} myCharacterId={myCharacterId} />;

  return (
    <Page>
      <InviteHeader onBack={() => navigate(-1)} />
      <Content>
        {status === 'loading' ? <Message role="status">로그인 상태를 확인하고 있어요.</Message> : (
          <ErrorCard
            error={{ title: '로그인 상태를 확인하지 못했어요.', description: '잠시 후 다시 시도해 주세요.' }}
            onRetry={() => window.location.reload()}
          />
        )}
      </Content>
    </Page>
  );
}

interface LoadError {
  title: string;
  description?: string;
}

// 노을 풍경 배경 위에 앱바와 (있으면) 팀 프로필을 놓는다. 없으면 풍경만 보이도록 자리만 둔다.
function InviteHeader({ onBack, children }: { onBack: () => void; children?: ReactNode }) {
  return (
    <HeaderBand>
      <HeaderBackground aria-hidden="true">
        <img src={headerImage} alt="" />
      </HeaderBackground>
      <AppBar title="초대 확인" onBack={onBack} />
      {children ?? <HeaderSpacer />}
    </HeaderBand>
  );
}

// 조회 실패 안내 카드. 다시 시도할 수 있는 오류일 때만 버튼을 보여준다.
function ErrorCard({ error, onRetry }: { error: LoadError; onRetry?: () => void }) {
  return (
    <ErrorBox role="alert">
      <ErrorTitle>{error.title}</ErrorTitle>
      {error.description && <ErrorDescription>{error.description}</ErrorDescription>}
      {onRetry && (
        <RetryButton variant="secondary" onClick={onRetry}>
          다시 시도
        </RetryButton>
      )}
    </ErrorBox>
  );
}

function InvitationContent({ token, myCharacterId }: { token: string | undefined; myCharacterId: number | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [team, setTeam] = useState<InvitationPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));
  const [loadError, setLoadError] = useState<LoadError | null>(token ? null : { title: '초대 링크를 확인해 주세요.' });
  // 서버 오류 등으로 조회에 실패했을 때만 다시 시도할 수 있다. 값이 바뀌면 다시 조회한다.
  const [canRetry, setCanRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [alreadyInTeam, setAlreadyInTeam] = useState(false);
  // 토스트가 사라지면 안내 문구를 비운다. Toast가 이 함수를 타이머에 쓰므로 고정해 둔다.
  const closeToast = useCallback(() => setMessage(''), []);
  const joinInProgress = useRef(false);
  const autoJoinStarted = useRef(false);
  const autoJoin = (location.state as { autoJoin?: boolean } | null)?.autoJoin === true;
  // 참여 현황의 내 프로필에 보여줄 동물 캐릭터. 미설정이면 '나' 글자를 보여준다.
  const myImage = characterImage(myCharacterId);

  // 초대 주소의 토큰으로 실제 팀 정보를 조회한다.
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    previewInvitation(token)
      .then(async (invitation) => {
        // 이미 이 팀의 팀원이면 초대 확인 없이 오아시스로 보낸다.
        // 내 팀 조회에 실패하면 초대 화면을 그대로 보여 준다. (합류하기에서 409로 다시 안내됨)
        const myTeams = await getMyTeams().catch(() => []);
        if (controller.signal.aborted) return;
        if (myTeams.some((myTeam) => myTeam.teamId === invitation.teamId)) {
          sessionStorage.removeItem('pendingInvitationUrl');
          // 뒤로 가기로 초대 화면에 다시 오지 않도록 기록을 바꿔치기한다.
          navigate('/oasis', { replace: true });
          return;
        }
        setTeam(invitation);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status === 404) {
          setLoadError({ title: '존재하지 않는 초대 링크예요.' });
        } else if (status === 410) {
          setLoadError({ title: '만료되었거나 회수된 초대 링크예요.' });
        } else {
          setLoadError({ title: '초대 정보를 불러오지 못했어요.', description: '잠시 후 다시 시도해 주세요.' });
          setCanRetry(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [token, retryCount, navigate]);

  const handleRetry = () => {
    setLoadError(null);
    setCanRetry(false);
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  };

  // 합류 결과의 팀 ID를 팀 공간에 전달한다.
  const handleJoin = useCallback(async () => {
    if (!token || !team || joinInProgress.current) return;
    joinInProgress.current = true;
    // 구글 인증으로 페이지를 떠나도 초대 주소가 유지되도록 저장한다.
    sessionStorage.setItem('pendingInvitationUrl', location.pathname + location.search + location.hash);
    setIsJoining(true);
    setMessage('');
    try {
      const joinedTeam = await acceptInvitation(token);
      sessionStorage.removeItem('pendingInvitationUrl');
      navigate(`/team?teamId=${joinedTeam.teamId}`, { replace: true });
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      if (status === 401) {
        navigate('/login');
      } else if (status === 403) {
        navigate('/profile');
      } else if (status === 409) {
        // 1인 1팀: 이미 이 팀이나 다른 팀에 소속된 경우
        sessionStorage.removeItem('pendingInvitationUrl');
        setAlreadyInTeam(true);
        setMessage(getApiErrorMessage(error, '이미 소속된 팀이 있어요.'));
      } else if (status === 404 || status === 410) {
        setTeam(null);
        setLoadError({ title: '초대 링크가 유효하지 않아요.', description: '새 초대 링크를 받아 주세요.' });
        sessionStorage.removeItem('pendingInvitationUrl');
      } else {
        setMessage('팀에 합류하지 못했어요. 다시 시도해 주세요.');
      }
    } finally {
      joinInProgress.current = false;
      setIsJoining(false);
    }
  }, [token, team, location.pathname, location.search, location.hash, navigate]);

  // 로그인·정보 입력을 마치고 돌아오면 한 번만 자동으로 합류한다.
  useEffect(() => {
    if (!autoJoin || !team || autoJoinStarted.current) return;
    const timer = window.setTimeout(() => {
      autoJoinStarted.current = true;
      void handleJoin();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [autoJoin, team, handleJoin]);

  return (
    <Page>
      <InviteHeader onBack={() => navigate(-1)}>
        {team && (
          <TeamProfile>
            <TeamAvatar aria-hidden="true">{team.teamName.slice(0, 1)}</TeamAvatar>
            <TeamName>{team.teamName}</TeamName>
          </TeamProfile>
        )}
      </InviteHeader>
      <Content>
        {isLoading && <Message role="status">초대 정보를 불러오고 있어요.</Message>}
        {loadError && <ErrorCard error={loadError} onRetry={canRetry ? handleRetry : undefined} />}
        {team && (
          <>
            <InviteInfoField
              label="함께할 프로젝트"
              value={
                <Project>
                  <ProjectName>{team.projectName}</ProjectName>
                  <ProjectIntro>{team.projectIntro}</ProjectIntro>
                </Project>
              }
            />
            <InviteInfoField
              label="함께하는 사자들"
              value={
                <Participation>
                  <Avatars>
                    {team.members?.slice(0, MAX_MEMBER_AVATARS).map((member, index) => {
                      const memberImage = characterImage(member.characterId);
                      return (
                        <MemberAvatar
                          key={`${member.name}-${index}`}
                          title={member.name}
                          $tone={AVATAR_TONES[index % AVATAR_TONES.length]}
                        >
                          {memberImage ? <img src={memberImage} alt={member.name} /> : member.name.slice(0, 1)}
                        </MemberAvatar>
                      );
                    })}
                    <MyAvatar>{myImage ? <img src={myImage} alt="" /> : '나'}</MyAvatar>
                  </Avatars>
                  <ParticipationText>
                    <ParticipationTitle>
                      현재 <ParticipationCount>{team.currentMemberCount}명</ParticipationCount>이 참여했어요
                    </ParticipationTitle>
                    <ParticipationCaption>수락하면 {team.expectedMemberCount}명이 돼요</ParticipationCaption>
                  </ParticipationText>
                </Participation>
              }
            />
          </>
        )}
      </Content>
      {message && (
        <ToastArea>
          <Toast variant="error" onClose={closeToast}>
            {message}
          </Toast>
        </ToastArea>
      )}
      {/* 조회 실패 화면에는 하단 버튼 없이 안내 카드만 보여준다. */}
      {!loadError && (
        <Footer>
          {alreadyInTeam ? (
            <JoinButton onClick={() => navigate('/team', { replace: true })}>내 팀으로 가기</JoinButton>
          ) : (
            <JoinButton onClick={handleJoin} disabled={isLoading || !team || isJoining}>
              {isJoining ? '합류하고 있어요.' : '합류하기'}
            </JoinButton>
          )}
        </Footer>
      )}
    </Page>
  );
}

const Page = styled.main`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 402px;
  min-height: 100svh;
  margin: 0 auto;
  background: #ffffff;
  color: #1e1e1e;
  line-height: normal;

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

// 상단 풍경 배경 + 앱바 + 팀 프로필 (Figma A03 header band)
const HeaderBand = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 58px 0 56px; /* 위: 상태바 자리, 아래: 내용 카드가 32px 겹쳐 올라오는 자리 */

  /* 풍경 위에 앱바가 보이도록 배경을 투명하게 하고, 스크롤 시 고정하지 않는다. */
  & > header {
    position: relative;
    background: transparent;
  }
`;

// 노을 풍경 일러스트. 헤더 높이가 달라도 위쪽 기준으로 꽉 채운다.
const HeaderBackground = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 0 0 28px 28px;
  background: #fff3dc;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
`;

const TeamProfile = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 4px 24px 0;
`;

// 팀 이름 첫 글자를 보여주는 팀 프로필
const TeamAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76px;
  height: 76px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background: var(--color-amber);
  box-shadow: 0 4px 0 var(--color-amber-shadow);
  color: var(--color-ink);
  font-family: var(--font-concept);
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.28px;
`;

const TeamName = styled.p`
  max-width: 100%;
  overflow: hidden;
  color: var(--color-ink);
  font-family: var(--font-concept);
  font-size: 28px;
  line-height: 1.25;
  letter-spacing: -0.28px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderSpacer = styled.div`
  height: 100px;
`;

// 초대 팀 정보 영역: 풍경 아래로 32px 겹쳐 올라오는 흰 카드
const Content = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 28px;
  margin-top: -32px;
  padding: 40px 24px 32px;
  border-radius: 24px 24px 0 0;
  background: #ffffff;
  box-shadow: 0 -5px 11px rgba(59, 42, 22, 0.17);
`;

// 조회 상태와 합류 안내
const Message = styled.p`
  margin: 0;
  color: #5b5b5b;
  font-size: 13px;
`;

// 하단 합류하기 영역
const Footer = styled.footer`
  position: sticky;
  bottom: 0;
  padding: 12px 24px 34px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

// 조회 실패 안내 카드 (Figma 카드/조회 실패)
const ErrorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 16px 24px;
  border: 1.5px solid var(--color-border);
  border-radius: 20px;
  background: #ffffff;
  text-align: center;
  overflow-wrap: anywhere;
`;

const ErrorTitle = styled.p`
  color: var(--color-ink);
  font-size: 20px;
  font-weight: 700;
`;

const ErrorDescription = styled.p`
  color: var(--color-text-secondary);
  font-size: 15px;
`;

// 설명과 버튼 사이는 Figma처럼 28px(카드 간격 8 + 20)
const RetryButton = styled(Button)`
  width: 100%;
  margin-top: 20px;
`;

// 합류 실패 안내 토스트: 하단 버튼 영역(98px) 위 16px에 띄운다.
const ToastArea = styled.div`
  position: fixed;
  bottom: 114px;
  left: 50%;
  z-index: 200;
  width: calc(100% - 48px);
  max-width: 354px;
  transform: translateX(-50%);

  /* 폰에서는 화면 너비를 꽉 채우고, 태블릿·노트북에서는 원래 모바일 크기를 유지한다. */
  @media (max-width: 480px) {
    max-width: none;
  }
`;

// 공통 버튼의 너비만 확장
const JoinButton = styled(Button)`
  width: 100%;
`;

// 함께할 프로젝트 상자 안: 프로젝트 이름과 소개
const Project = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ProjectName = styled.p`
  color: var(--color-ink);
  font-weight: 700;
`;

const ProjectIntro = styled.p`
  color: var(--color-text-secondary);
`;

// 함께하는 사자들 상자 안: 왼쪽 프로필 줄, 오른쪽 인원 안내 (Figma 카드 높이 100)
const Participation = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 65px;
`;

// 인원 안내 글자는 줄어들거나 줄바꿈되지 않고, 남는 너비는 프로필 줄이 쓴다.
const ParticipationText = styled.div`
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
`;

const ParticipationTitle = styled.p`
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.16px;
`;

// 현재 인원 강조
const ParticipationCount = styled.span`
  color: var(--color-orange);
`;

// 팀원 프로필은 앞에서부터 4명까지만 보여 준다. (나까지 최대 5개) 전체 인원은 옆 글자로 안내한다.
const MAX_MEMBER_AVATARS = 4;

// 프로필 동그라미를 겹쳐 한 줄로 놓는다.
// 3개까지는 Figma대로 10px, 4~5개는 좁은 폰(360px)에서도 글자 자리가 남도록 더 겹친다.
const Avatars = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;

  & > * + * {
    margin-left: -10px;
  }

  &:has(> :nth-child(4)) > * + * {
    margin-left: -20px;
  }

  &:has(> :nth-child(5)) > * + * {
    margin-left: -27px;
  }
`;

// 팀원 프로필 배경색을 차례로 돌려 쓴다 (Figma Member Avatar)
const AVATAR_TONES = ['#fff0cc', '#e9f4fb', '#fbefe5'];

// 현재 팀원 프로필: 각자 고른 동물 캐릭터. 캐릭터가 없으면 이름 첫 글자를 보여준다.
// 흰 테두리로 겹친 동그라미끼리 구분한다.
const MemberAvatar = styled.span<{ $tone?: string }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  overflow: hidden;
  border: 2px solid #ffffff;
  border-radius: 50%;
  background: ${({ $tone }) => $tone ?? AVATAR_TONES[0]};
  color: var(--color-brown);
  font-size: 13px;
  font-weight: 700;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// 합류할 나: 점선 테두리로 구분하고 내 동물 캐릭터를 보여준다.
const MyAvatar = styled(MemberAvatar)`
  border: 1.5px dashed var(--color-orange);
  background: var(--color-amber-bg);
  color: var(--color-orange);
`;

const ParticipationCaption = styled.p`
  color: var(--color-text-secondary);
  font-size: 13px;
`;
