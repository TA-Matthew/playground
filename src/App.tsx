import { Routes, Route } from 'react-router-dom'
import {
  AI_REVIEW_PROJECT_PATH,
  AVAILABILITY_SHORTCUT_PROJECT_PATH,
  LOGISTICS_PROJECT_PATH,
  LOYALTY_LOGIN_BUTTON_PATH,
  PDP_TEMPLATE_PROJECT_PATH,
  PRODUCT_HIGHLIGHT_PROJECT_PATH,
} from './data/projects'
import { AiReviewPage } from './pages/AiReviewPage'
import { AvailabilityShortcutPage } from './pages/AvailabilityShortcutPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { HomePage } from './pages/HomePage'
import { LoyaltyLoginButtonPage } from './pages/LoyaltyLoginButtonPage'
import { PdpTemplatePage } from './pages/PdpTemplatePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={LOGISTICS_PROJECT_PATH} element={<ExperiencePage />} />
      <Route path={PRODUCT_HIGHLIGHT_PROJECT_PATH} element={<ExperiencePage />} />
      <Route path={PDP_TEMPLATE_PROJECT_PATH} element={<PdpTemplatePage />} />
      <Route path={AVAILABILITY_SHORTCUT_PROJECT_PATH} element={<AvailabilityShortcutPage />} />
      <Route path={AI_REVIEW_PROJECT_PATH} element={<AiReviewPage />} />
      <Route path={LOYALTY_LOGIN_BUTTON_PATH} element={<LoyaltyLoginButtonPage />} />
    </Routes>
  )
}
