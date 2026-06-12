import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage Keys
const USER_KEY = 'mock_portfolio_user';
const REGISTERED_USERS_KEY = 'mock_portfolio_registered_users';

const getRegisteredUsers = async () => {
  try {
    const users = await AsyncStorage.getItem(REGISTERED_USERS_KEY);
    if (!users) {
      // Default admin user
      const defaultUsers = [{ email: 'test', password: 'Test@123' }];
      await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(users);
  } catch (error) {
    console.error("Error reading registered users:", error);
    return [{ email: 'test', password: 'Test@123' }];
  }
};

export const getMockCurrentUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Error reading current user:", error);
    return null;
  }
};

export const mockLogin = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email/Username and password are required.');
  }

  const users = await getRegisteredUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!matchedUser) {
    throw new Error('Invalid email/username or password.');
  }

  const mockUser = {
    uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
    email: matchedUser.email,
    displayName: matchedUser.email.includes('@') ? matchedUser.email.split('@')[0] : matchedUser.email,
  };
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const mockSignUp = async (email, password) => {
  if (!email || !password) {
    throw new Error('Email/Username and password are required.');
  }

  const users = await getRegisteredUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('User already exists.');
  }

  users.push({ email, password });
  await AsyncStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  return mockLogin(email, password);
};

export const mockLogout = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
