import { Routes, Route } from 'react-router-dom'
import { LOGISTICS_PROJECT_PATH } from './data/projects'
import { ExperiencePage } from './pages/ExperiencePage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path={LOGISTICS_PROJECT_PATH} element={<ExperiencePage />} />
    </Routes>
  )
}
