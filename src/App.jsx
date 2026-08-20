import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import DiscoverPage from './pages/DiscoverPage'
import RecipesPage from './pages/RecipesPage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import MovesPage from './pages/MovesPage'
import MoveDetailPage from './pages/MoveDetailPage'
import CommunityPage from './pages/CommunityPage'
import CommunityDetailPage from './pages/CommunityDetailPage'
import ChallengesPage from './pages/ChallengesPage'
import ChallengeDetailPage from './pages/ChallengeDetailPage'
import DiscoverDetailPage from './pages/DiscoverDetailPage'
import DashboardPage from './pages/DashboardPage'
import CreatorProfilePage from './pages/CreatorProfilePage'
import CreatePage from './pages/CreatePage'
import ProfilePage from './pages/ProfilePage'
import MessagesPage from './pages/MessagesPage'
import FeedPage from './pages/FeedPage'
import PeoplePage from './pages/PeoplePage'
import NotificationsPage from './pages/NotificationsPage'
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
          <Route path="discover/:id" element={<DiscoverDetailPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />
          <Route path="moves" element={<MovesPage />} />
          <Route path="moves/:id" element={<MoveDetailPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="community/:slug" element={<CommunityDetailPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="creators/:id" element={<CreatorProfilePage />} />
          <Route
            path="feed"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="people"
            element={
              <ProtectedRoute>
                <PeoplePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="messages/:userId"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            }
          />
          <Route path="login" element={<LoginPage />} />
          <Route path="join" element={<JoinPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
