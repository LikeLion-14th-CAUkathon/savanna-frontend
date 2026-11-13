import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import homeIcon from '../../assets/icons/tabs/tab-home.svg';
import homeActiveIcon from '../../assets/icons/tabs/tab-home-active.svg';
import searchIcon from '../../assets/icons/tabs/tab-search.svg';
import searchActiveIcon from '../../assets/icons/tabs/tab-search-active.svg';
import teamIcon from '../../assets/icons/tabs/tab-team.svg';
import teamActiveIcon from '../../assets/icons/tabs/tab-team-active.svg';
import profileIcon from '../../assets/icons/tabs/tab-profile.svg';
import profileActiveIcon from '../../assets/icons/tabs/tab-profile-active.svg';

export type TabId = 'oasis' | 'search' | 'team' | 'mypage'; // 탭 id를 Union Type으로 정의하기. 부모 페이지도 쓰니까 export

interface Tab {
  id: TabId;
  label: string;
  path: string;        // 눌렀을 때 이동할 화면 주소
  icon: string;        // 선택 안 됐을 때 아이콘 (회색)
  activeIcon: string;  // 선택됐을 때 아이콘 (주황)
}

interface TabBarProps {
  activeTab: TabId;                    // 지금 선택된 탭 (부모가 알려줌)
  hasNew?: boolean;                    // 팀 공간 탭에 새 소식 점 표시
  rounded?: boolean;                   // 위쪽 모서리를 둥글게 (오아시스 홈 화면)
}

const TAB_LIST: Tab[] = [
  { id: 'oasis', label: '오아시스', path: '/oasis', icon: homeIcon, activeIcon: homeActiveIcon },
  { id: 'search', label: '공고 찾기', path: '/contest', icon: searchIcon, activeIcon: searchActiveIcon },
  { id: 'team', label: '팀 공간', path: '/team', icon: teamIcon, activeIcon: teamActiveIcon },
  { id: 'mypage', label: '마이페이지', path: '/mypage', icon: profileIcon, activeIcon: profileActiveIcon },
];

// 탭을 누르면 해당 화면으로 이동한다. 이미 그 화면이면 이동하지 않는다.
export default function TabBar({ activeTab, hasNew = false, rounded = false }: TabBarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const goToTab = (tab: Tab) => {
    if (pathname !== tab.path) navigate(tab.path);
  };

  return (
    <Bar $rounded={rounded}>
      {TAB_LIST.map((tab) => {
        const isActive = activeTab === tab.id; // 지금 선택된 탭이냐?
        const showNewDot = tab.id === 'team' && hasNew;

        return (
          <TabButton
            key={tab.id}
            type="button"
            $active={isActive}
            aria-current={isActive ? 'page' : undefined}
            aria-label={showNewDot ? `${tab.label}, 새 소식 있음` : tab.label}
            onClick={() => goToTab(tab)}
          >
            <IconWrap>
              <Icon src={isActive ? tab.activeIcon : tab.icon} alt="" />
              {showNewDot && <NewDot aria-hidden="true" />}
            </IconWrap>
            <span>{tab.label}</span>
          </TabButton>
        );
      })}
    </Bar>
  );
}

const Bar = styled.nav<{ $rounded: boolean }>`
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  height: 75px;
  padding-top: 10px;
  border-top: 1px solid #e7e5e0;
  border-radius: ${({ $rounded }) => ($rounded ? '20px 20px 0 0' : '0')};
  background: #fafaf8;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 0 12px;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? '#d97700' : '#999896')};
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  letter-spacing: 0;
  white-space: nowrap;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d97700;
    outline-offset: -2px;
    border-radius: 4px;
  }
`;

const IconWrap = styled.span`
  position: relative; /* 뱃지를 아이콘 위에 겹쳐 놓기 위한 기준점 */
  width: 24px;
  height: 24px;
`;

const Icon = styled.img`
  display: block;
`;

const NewDot = styled.span`
  position: absolute;
  top: -1px;
  left: 20px;
  width: 9px;
  height: 9px;
  border-radius: 4.5px;
  background: #ffb72b;
`;
