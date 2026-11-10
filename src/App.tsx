import { Routes, Route } from 'react-router'
import ContestSearchPage from './pages/contest-search/ContestSearchPage'
import OasisPage from './pages/oasis/OasisPage'
import LoginPage from './pages/onboarding/LoginPage'
import ProfilePage from './pages/onboarding/ProfilePage'

function App() {
  return (
    <Routes>
      <Route path="/contest" element={<ContestSearchPage />} />
      <Route path="/oasis" element={<OasisPage />} />
      <Route path="/login" element={<LoginPage onGoogleLogin={() => console.log('구글 로그인 미연동')}/>} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default App
