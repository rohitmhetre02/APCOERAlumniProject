import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { MessageProvider } from './context/MessageContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
