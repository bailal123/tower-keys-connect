import AppRouter from './components/layout/AppRouter'
import { NotificationProvider } from './hooks/useNotifications'
import './App.css'
import './index.css';


function App() {
  return (
    <NotificationProvider>
      <AppRouter />
    </NotificationProvider>
  )
}

export default App
