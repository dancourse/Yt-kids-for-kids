import { Routes, Route } from 'react-router-dom'
import ProfileSelect from './pages/ProfileSelect'
import WatchPage from './pages/WatchPage'
import ParentDashboard from './pages/parent/ParentDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProfileSelect />} />
      <Route path="/watch/:profileId" element={<WatchPage />} />
      <Route path="/parent" element={<ParentDashboard />} />
    </Routes>
  )
}

export default App
