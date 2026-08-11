import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import RecipesPage from './pages/RecipesPage'
import MovesPage from './pages/MovesPage'
import CommunityPage from './pages/CommunityPage'
import ChallengesPage from './pages/ChallengesPage'
import LoginPage from './pages/LoginPage'
import JoinPage from './pages/JoinPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="moves" element={<MovesPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="join" element={<JoinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
