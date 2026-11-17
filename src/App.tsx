import { Routes, Route, Navigate } from 'react-router'
import { useCallback, useState } from 'react'
import ToastContainer from './components/toast/ToastContainer'
import { startGoogleLogin } from './api/auth'
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
import TeamEditPage from './pages/team/TeamEditPage'
import TeamSpacePage from './pages/team/TeamSpacePage'
import TeamNews from './pages/team/TeamNews'

function App() {
  // 로그인 화면을 떠난 뒤에도 성공 토스트가 보이도록 App에서 관리한다.
  const [loginResult, setLoginResult] = useState<'success' | 'error' | 'logout' | null>(null)
  const closeLoginToast = useCallback(() => setLoginResult(null), [])

  return (
    <>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/contest" element={<ContestSearchPage />} />
      <Route path="/contest/:contestId" element={<ContestDetailPage />} />
      <Route path="/oasis" element={<OasisPage />} />
      <Route path="/oasis/expeditions/:expeditionId" element={<ExpeditionDetailPage />} />
      <Route path="/oasis/expeditions/:expeditionId/schedule" element={<ScheduleEditPage />} />
      <Route path="/login" element={<LoginPage onGoogleLogin={startGoogleLogin} onLoginResult={setLoginResult} />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/mypage" element={<Mypage onLogoutSuccess={() => setLoginResult('logout')} />} />
      <Route path="/team" element={<TeamSpacePage />} />
      <Route path="/team/create" element={<TeamCreatePage />} />
      <Route path="/team/edit" element={<TeamEditPage />} />
      <Route path="/team/news" element={<TeamNews />} />
    </Routes>
    <ToastContainer result={loginResult} onClose={closeLoginToast} />
    </>
  )
}

export default App