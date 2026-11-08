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
  icon: string;        // 선택 안 됐을 때 아이콘 (회색)
  activeIcon: string;  // 선택됐을 때 아이콘 (주황)
}

interface TabBarProps {
  activeTab: TabId;                    // 지금 선택된 탭 (부모가 알려줌)
  onTabChange: (tab: TabId) => void;   // 탭을 눌렀을 때 부모에게 알려주는 함수
  unreadCount?: number;                // 팀 소식 탭에 보여줄 읽지 않은 소식 개수
}

const TAB_LIST: Tab[] = [
  { id: 'oasis', label: '오아시스', icon: homeIcon, activeIcon: homeActiveIcon },
  { id: 'search', label: '공고 찾기', icon: searchIcon, activeIcon: searchActiveIcon },
  { id: 'team', label: '팀 소식', icon: teamIcon, activeIcon: teamActiveIcon },
  { id: 'mypage', label: '마이페이지', icon: profileIcon, activeIcon: profileActiveIcon },
];

export default function TabBar({ activeTab, onTabChange, unreadCount = 0 }: TabBarProps) {
  return (
    <Bar>
      {TAB_LIST.map((tab) => {
        const isActive = activeTab === tab.id; // 지금 선택된 탭이냐?
        const hasBadge = tab.id === 'team' && unreadCount > 0; // 팀 소식 탭에만, 읽지 않은 소식이 있을 때 뱃지 표시

        return (
          <TabButton
            key={tab.id}
            type="button"
            $active={isActive}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
          >
            <IconWrap>
              <Icon src={isActive ? tab.activeIcon : tab.icon} alt="" />
              {hasBadge && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
            </IconWrap>
            <span>{tab.label}</span>
          </TabButton>
        );
      })}
    </Bar>
  );
}

const Bar = styled.nav`
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  width: 402px;
  max-width: 100%;
  height: 75px;
  padding-top: 10px;
  border-top: 1px solid #e7e5e0;
  background: #fafaf8;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex: 1;
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

const Badge = styled.span`
  position: absolute;
  top: -4px;
  left: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 16px;
  height: 16px;
  padding: 0 2px;
  border-radius: 999px;
  background: #ffb72b;
  color: #1e1e1e;
  font-size: 11px;
`;