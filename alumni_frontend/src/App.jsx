import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { MessageProvider } from './context/MessageContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <NotificationProvider>
      <MessageProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </MessageProvider>
    </NotificationProvider>
  );
}

export default App;
