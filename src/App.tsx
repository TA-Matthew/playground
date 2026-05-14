import { Routes, Route } from 'react-router-dom'
import {
  AI_REVIEW_PROJECT_PATH,
  LOGISTICS_PROJECT_PATH,
  LOYALTY_LOGIN_BUTTON_PATH,
  PRODUCT_HIGHLIGHT_PROJECT_PATH,
} from './data/projects'
import { AiReviewPage } from './pages/AiReviewPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { HomePage } from './pages/HomePage'
import { LoyaltyLoginButtonPage } from './pages/LoyaltyLoginButtonPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={LOGISTICS_PROJECT_PATH} element={<ExperiencePage />} />
      <Route path={PRODUCT_HIGHLIGHT_PROJECT_PATH} element={<ExperiencePage />} />
      <Route path={AI_REVIEW_PROJECT_PATH} element={<AiReviewPage />} />
      <Route path={LOYALTY_LOGIN_BUTTON_PATH} element={<LoyaltyLoginButtonPage />} />
    </Routes>
  )
}
