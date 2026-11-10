import { Routes, Route, Navigate } from 'react-router'
import ContestSearchPage from './pages/contest-search/ContestSearchPage'
import OasisPage from './pages/oasis/OasisPage'

function App() {
  return (
    <Routes>
      <Route path="/contest" element={<ContestSearchPage />} />
      <Route path="/oasis" element={<OasisPage />} />
    </Routes>
  )
}

export default App
