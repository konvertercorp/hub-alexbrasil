import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingInstall } from './pages/LandingInstall'
import { Dashboard } from './pages/Dashboard'
import { ModulePlaceholder } from './pages/ModulePlaceholder'
import { VotoRequest } from './pages/VotoRequest'
import { VotoList } from './pages/VotoList'
import { Localizacao } from './pages/Localizacao'
import { Login } from './pages/Login'
import { Setup } from './pages/Setup'
import { ConviteCadastro } from './pages/ConviteCadastro'
import { Equipe } from './pages/Equipe'
import { Ranking } from './pages/Ranking'
import { Medalhas } from './pages/Medalhas'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { useDeviceContext } from './hooks/useDeviceContext'

const MODULE_ROUTES = [
  { path: '/atividades', title: 'Atividades' },
  { path: '/noticias', title: 'Notícias' },
  { path: '/emendas', title: 'Emendas' },
]

function Home() {
  const { showDashboard } = useDeviceContext()
  if (!showDashboard) return <LandingInstall />
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/convite/:code" element={<ConviteCadastro />} />
          <Route
            path="/equipe"
            element={
              <RequireAuth>
                <Equipe />
              </RequireAuth>
            }
          />
          <Route
            path="/votos"
            element={
              <RequireAuth>
                <VotoRequest />
              </RequireAuth>
            }
          />
          <Route
            path="/votos/lista"
            element={
              <RequireAuth>
                <VotoList />
              </RequireAuth>
            }
          />
          <Route
            path="/localizacao"
            element={
              <RequireAuth>
                <Localizacao />
              </RequireAuth>
            }
          />
          <Route
            path="/ranking"
            element={
              <RequireAuth>
                <Ranking />
              </RequireAuth>
            }
          />
          <Route
            path="/medalhas"
            element={
              <RequireAuth>
                <Medalhas />
              </RequireAuth>
            }
          />
          {MODULE_ROUTES.map(({ path, title }) => (
            <Route
              key={path}
              path={path}
              element={
                <RequireAuth>
                  <ModulePlaceholder title={title} />
                </RequireAuth>
              }
            />
          ))}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
