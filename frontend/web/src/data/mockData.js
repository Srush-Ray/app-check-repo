import { v4 as uuidv4 } from 'uuid';

export const personalInfo = {
  name: "Srushti Raybhoge",
  title: "Software Engineer 2 at Addepar",
  highlight: "Google Developer Expert - Firebase",
};

export const contactDetails = {
  email: "xyz@gmail.com",
  phone: "1234567890",
  linkedin: "https://www.linkedin.com/in/srushti-raybhoge/"
};

export const experienceData = [
  {
    companyName: "Addepar",
    roles: [
      {
        title: "Software Engineer 2",
        duration: "July 2024 - Present"
      }
    ]
  },
  {
    companyName: "Bajaj Finserv Health Ltd",
    roles: [
      {
        title: "Software Development Engineer",
        duration: "August 2022 - June 2024"
      },
      {
        title: "Associate Software Development Engineer",
        duration: "August 2021 - September 2022"
      }
    ]
  }
];

export const technologiesData = [
  "Java", "JavaScript", "React", "Python", "Firebase"
];

const DEFAULT_SHOUTOUTS = [
  {
    id: "shoutout-1",
    name: "Alex Rivera",
    feedback: "Srushti is an exceptional engineer. Her depth of knowledge in frontend systems and attention to detail made our collaboration on the client dashboard a huge success!"
  },
  {
    id: "shoutout-2",
    name: "Priya Patel",
    feedback: "Working with Srushti was a breeze. She quickly resolves technical roadblocks and is a highly proactive communicator."
  }
];

// LocalStorage Keys
const SHOUTOUTS_KEY = 'mock_portfolio_shoutouts';
const USER_KEY = 'mock_portfolio_user';

// Shoutout helper functions
export const getMockShoutouts = () => {
  const shoutouts = localStorage.getItem(SHOUTOUTS_KEY);
  if (!shoutouts) {
    localStorage.setItem(SHOUTOUTS_KEY, JSON.stringify(DEFAULT_SHOUTOUTS));
    return DEFAULT_SHOUTOUTS;
  }
  return JSON.parse(shoutouts);
};

export const addMockShoutout = (name, feedback) => {
  const shoutouts = getMockShoutouts();
  const newShoutout = {
    id: uuidv4(),
    name,
    feedback
  };
  shoutouts.push(newShoutout);
  localStorage.setItem(SHOUTOUTS_KEY, JSON.stringify(shoutouts));
  return newShoutout;
};

export const deleteMockShoutout = (id) => {
  const shoutouts = getMockShoutouts();
  const updatedShoutouts = shoutouts.filter(item => item.id !== id);
  localStorage.setItem(SHOUTOUTS_KEY, JSON.stringify(updatedShoutouts));
  return updatedShoutouts;
};

// Auth helper functions
const REGISTERED_USERS_KEY = 'mock_portfolio_registered_users';

const getRegisteredUsers = () => {
  const users = localStorage.getItem(REGISTERED_USERS_KEY);
  if (!users) {
    // Default admin user
    const defaultUsers = [{ email: 'test', password: 'Test@123' }];
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(users);
};

export const getMockCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const mockLogin = (email, password) => {
  if (!email || !password) {
    throw new Error('Email/Username and password are required.');
  }

  // Check against registered users (which defaults to including test/Test@123)
  const users = getRegisteredUsers();
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!matchedUser) {
    throw new Error('Invalid email/username or password.');
  }

  const mockUser = {
    uid: 'mock-user-id-' + Math.random().toString(36).substr(2, 9),
    email: matchedUser.email,
    displayName: matchedUser.email.includes('@') ? matchedUser.email.split('@')[0] : matchedUser.email,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
  return mockUser;
};

export const mockSignUp = (email, password) => {
  if (!email || !password) {
    throw new Error('Email/Username and password are required.');
  }

  const users = getRegisteredUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('User already exists.');
  }

  users.push({ email, password });
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

  return mockLogin(email, password);
};

export const mockLogout = () => {
  localStorage.removeItem(USER_KEY);
};
