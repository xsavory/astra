import { useContext } from 'react';

import { AuthContext } from 'src/contexts/auth';

/**
 * Custom hook to access authentication context
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth