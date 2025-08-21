import { useAppSelector } from '../store/hooks';

export const useUser = () => {
  const userRedux = useAppSelector((state) => state.user);

  return {
    userRedux,
    // Convenient getters for common user properties
    userId: userRedux?._id,
    userEmail: userRedux?.email,
    username: userRedux?.username,
    userCode: userRedux?.userCode,
    // Check if user is authenticated (has any data)
    isAuthenticated: !!userRedux && Object.keys(userRedux).length > 0,
  };
};