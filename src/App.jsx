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
import { GestaoLayout } from './pages/gestao/GestaoLayout'
import { GestaoDashboard } from './pages/gestao/GestaoDashboard'
import { GestaoGraficos } from './pages/gestao/GestaoGraficos'
import { GestaoNoticias } from './pages/gestao/GestaoNoticias'
import { GestaoEleitores } from './pages/gestao/GestaoEleitores'
import { GestaoEquipe } from './pages/gestao/GestaoEquipe'
import { GestaoCheckins } from './pages/gestao/GestaoCheckins'
import { GestaoAtividade } from './pages/gestao/GestaoAtividade'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { RequireAdmin } from './components/RequireAdmin'
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
          <Route
            path="/gestao"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <GestaoLayout />
                </RequireAdmin>
              </RequireAuth>
            }
          >
            <Route index element={<GestaoDashboard />} />
            <Route path="graficos" element={<GestaoGraficos />} />
            <Route path="noticias" element={<GestaoNoticias />} />
            <Route path="eleitores" element={<GestaoEleitores />} />
            <Route path="equipe" element={<GestaoEquipe />} />
            <Route path="checkins" element={<GestaoCheckins />} />
            <Route path="atividade" element={<GestaoAtividade />} />
          </Route>
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
