import { useNavigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <AuthProvider navigate={navigate}>
      {children}
    </AuthProvider>
  );
};

export default AuthWrapper;
