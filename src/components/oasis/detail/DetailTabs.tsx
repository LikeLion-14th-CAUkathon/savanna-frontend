import styled from 'styled-components';

export type DetailTabId = 'conditions' | 'schedule';

const TABS: { id: DetailTabId; label: string }[] = [
  { id: 'conditions', label: '지원 조건' },
  { id: 'schedule', label: '일정 & 제출 준비' },
];

interface DetailTabsProps {
  activeTab: DetailTabId;
  onChange: (tab: DetailTabId) => void;
}

export default function DetailTabs({ activeTab, onChange }: DetailTabsProps) {
  return (
    <TabList role="tablist">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Tab
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            $active={isActive}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Tab>
        );
      })}
    </TabList>
  );
}

const TabList = styled.div`
  display: flex;
  gap: 4px;
  box-sizing: border-box;
  width: 100%;
  padding: 4px;
  border-radius: 12px;
  background: var(--color-gray-bg);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 1.5px solid ${({ $active }) => ($active ? 'var(--color-amber)' : 'transparent')};
  border-radius: 10px;
  background: ${({ $active }) => ($active ? 'var(--color-amber-bg)' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? '0 2px 0 var(--color-amber)' : 'none')};
  color: ${({ $active }) => ($active ? 'var(--color-orange)' : 'var(--color-text-tertiary)')};
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--color-orange);
    outline-offset: 2px;
  }
`;
