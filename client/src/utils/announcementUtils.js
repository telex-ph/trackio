// announcementUtils.js - COMBINED LIKES AND VIEWS SYSTEM
export const getAnnouncementDepartment = (postedBy = '') => {
  if (!postedBy) return "HR & Admin";
  
  const postedByLower = postedBy.toLowerCase();
  
  if (postedByLower.includes('anjanneth') && postedByLower.includes('bilas')) {
    return 'Accounting';
  } else if (postedByLower.includes('maybelle') && postedByLower.includes('cabalar')) {
    return 'Compliance';
  } else if (postedByLower.includes('mark jason robes') ||
           postedByLower.includes('mark jason') ||
           postedByLower.includes('robes')) {
    return 'Technical';
  } else if (postedByLower.includes('fatima') && postedByLower.includes('guzman')) {
    return 'HR & Admin';
  } else {
    return 'HR & Admin';
  }
};

// Get real user data from database
export const getRealUserData = () => {
  try {
    console.log("🔄 Getting real user data...");
    
    const userFromStore = JSON.parse(localStorage.getItem('user-store') || sessionStorage.getItem('user-store') || '{}');
    const userDirect = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    
    let user = {};
    
    if (userFromStore && userFromStore.state && userFromStore.state.user) {
      user = userFromStore.state.user;
    } else if (userDirect && (userDirect._id || userDirect.employeeId)) {
      user = userDirect;
    } else {
      const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
      const employeeId = localStorage.getItem('employeeId') || sessionStorage.getItem('employeeId');
      const firstName = localStorage.getItem('firstName') || sessionStorage.getItem('firstName');
      const lastName = localStorage.getItem('lastName') || sessionStorage.getItem('lastName');
      const email = localStorage.getItem('email') || sessionStorage.getItem('email');
      
      if (userId || employeeId) {
        user = {
          _id: userId,
          employeeId: employeeId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          name: firstName && lastName ? `${firstName} ${lastName}` : 'User'
        };
      }
    }
    
    if (!user._id && !user.employeeId) {
      return {
        userId: '',
        employeeId: '',
        userName: '',
        fullName: ''
      };
    }
    
    const result = {
      userId: user._id || user.employeeId,
      employeeId: user.employeeId,
      userName: user.email || user.name,
      fullName: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
    
    console.log("🎉 Final real user data:", result);
    return result;
    
  } catch (error) {
    console.error('❌ Error getting real user data:', error);
    return {
      userId: '',
      employeeId: '', 
      userName: '',
      fullName: ''
    };
  }
};

// Backward compatibility
export const getPersistentUserId = () => getRealUserData().userId;
export const getPersistentUserName = () => getRealUserData().fullName;
export const getPersistentUserEmployeeId = () => getRealUserData().employeeId;
export const getPersistentUserDepartment = () => getRealUserData().department || 'Unknown Department';

// COMBINED LIKES AND VIEWS STORAGE SYSTEM
const getUserInteractionsKey = (userId) => `user_${userId}_interactions`;

export const getUserInteractions = (userId) => {
  try {
    const interactions = localStorage.getItem(getUserInteractionsKey(userId));
    return interactions ? JSON.parse(interactions) : { views: {}, likes: {} };
  } catch (error) {
    console.error('Error reading user interactions:', error);
    return { views: {}, likes: {} };
  }
};

export const saveUserInteraction = (userId, announcementId, type) => {
  try {
    const interactions = getUserInteractions(userId);
    interactions[type][announcementId] = true;
    localStorage.setItem(getUserInteractionsKey(userId), JSON.stringify(interactions));
  } catch (error) {
    console.error('Error saving user interaction:', error);
  }
};

// Check if user has already viewed/liked an announcement
export const hasUserViewed = (userId, announcementId) => {
  const interactions = getUserInteractions(userId);
  return !!interactions.views[announcementId];
};

export const hasUserLiked = (userId, announcementId) => {
  const interactions = getUserInteractions(userId);
  return !!interactions.likes[announcementId];
};