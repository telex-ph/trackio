export const getAnnouncementDepartment = (postedBy = '') => 
  
    {
      //HR & ADMIN 
      if (!postedBy) return "HR & Admin";
      const postedByLower = postedBy.toLowerCase();
      
      //ACCOUNTING 
      if (postedByLower.includes('anjanneth') && postedByLower.includes('bilas')) {
        return 'Accounting';

      //COMPLIANCE  
      } else if (postedByLower.includes('maybelle') && postedByLower.includes('cabalar')) {
        return 'Compliance';

      //IT TECHNICAL 
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


    export const getRealUserData = () => {
      try {
        console.log("Getting real user data...");
        
        // IMPORTING ZUSTAND
        let zustandUser = null;

        try {
          import('../store/useStore.js')
            .then(({ useStore }) => {
              zustandUser = useStore.getState().user;
            })
            .catch(() => {
              console.log("Zustand store not available, using localStorage fallback");
            });
        } catch {
          console.log("Error loading Zustand, using fallback");
        }
        
        // USE ZUSTAND
        if (zustandUser && (zustandUser._id || zustandUser.employeeId)) {
          console.log("Using user from Zustand store:", zustandUser);
          const fullName = zustandUser.name || 
                          `${zustandUser.firstName || ''} ${zustandUser.lastName || ''}`.trim() ||
                          'Unknown User';
      
      return {
        userId: zustandUser._id || zustandUser.employeeId,
        employeeId: zustandUser.employeeId,
        userName: zustandUser.email || zustandUser.name,
        fullName: fullName,
        firstName: zustandUser.firstName,
        lastName: zustandUser.lastName,
        email: zustandUser.email,
        role: zustandUser.role
      };
    }
    
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
    
    const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
    
    const result = {
      userId: user._id || user.employeeId,
      employeeId: user.employeeId,
      userName: user.email || user.name,
      fullName: fullName,
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

export const getPersistentUserId = () => getRealUserData().userId;
export const getPersistentUserName = () => getRealUserData().fullName;
export const getPersistentUserEmployeeId = () => getRealUserData().employeeId;
export const getPersistentUserDepartment = () => getRealUserData().department || 'Unknown Department';

    // Check if user has already viewed an announcement (from database)
    export const hasUserViewed = async (announcement, userId) => {
      try {
        if (!announcement?.views || !Array.isArray(announcement.views)) return false;
        return announcement.views.some(view => view.userId === userId);
      } catch (error) {
        console.error('Error checking user view:', error);
        return false;
      }
    };

    // Check if user has already liked an announcement (from database)
    export const hasUserLiked = async (announcement, userId) => {
      try {
        if (!announcement?.acknowledgements || !Array.isArray(announcement.acknowledgements)) return false;
        return announcement.acknowledgements.some(ack => ack.userId === userId);
      } catch (error) {
        console.error('Error checking user like:', error);
        return false;
      }
    };