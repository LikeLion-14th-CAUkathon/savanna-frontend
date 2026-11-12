import { Routes, Route, Navigate } from 'react-router'
import ContestSearchPage from './pages/contest-search/ContestSearchPage'
import ContestDetailPage from './pages/contest-search/ContestDetailPage'
import OasisPage from './pages/oasis/OasisPage'
import ExpeditionDetailPage from './pages/oasis/ExpeditionDetailPage'
import ScheduleEditPage from './pages/oasis/ScheduleEditPage'
import LoginPage from './pages/onboarding/LoginPage'
import ProfilePage from './pages/onboarding/ProfilePage'
import InvitePage from './pages/onboarding/InvitePage'
import Mypage from './pages/mypage/Mypage'
import TeamCreatePage from './pages/team/TeamCreatePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/contest" element={<ContestSearchPage />} />
      <Route path="/contest/:contestId" element={<ContestDetailPage />} />
      <Route path="/oasis" element={<OasisPage />} />
      <Route path="/oasis/expeditions/:expeditionId" element={<ExpeditionDetailPage />} />
      <Route path="/oasis/expeditions/:expeditionId/schedule" element={<ScheduleEditPage />} />
      <Route path="/login" element={<LoginPage onGoogleLogin={() => console.log('구글 로그인 미연동')}/>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="/mypage" element={<Mypage />} />
      <Route path="/team/create" element={<TeamCreatePage />} />
    </Routes>
  )
}

export default App