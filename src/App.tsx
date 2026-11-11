import { Routes, Route } from 'react-router'
import ContestSearchPage from './pages/contest-search/ContestSearchPage'
import OasisPage from './pages/oasis/OasisPage'
import ExpeditionDetailPage from './pages/oasis/ExpeditionDetailPage'
import LoginPage from './pages/onboarding/LoginPage'
import ProfilePage from './pages/onboarding/ProfilePage'
import InvitePage from './pages/onboarding/InvitePage'

function App() {
  return (
    <Routes>
      <Route path="/contest" element={<ContestSearchPage />} />
      <Route path="/oasis" element={<OasisPage />} />
      <Route path="/oasis/expeditions/:expeditionId" element={<ExpeditionDetailPage />} />
      <Route path="/login" element={<LoginPage onGoogleLogin={() => console.log('구글 로그인 미연동')}/>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/invite" element={<InvitePage />} />
    </Routes>
  )
}

export default App
