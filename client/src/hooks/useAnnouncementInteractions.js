  import { useState, useCallback } from 'react';
  import api from '../utils/axios';
  import { 
    
    saveUserInteraction, 
    hasUserViewed, 
    hasUserLiked,
    getRealUserData 

  } from '../utils/announcementUtils';

      export const useAnnouncementInteractions = (announcements, setAnnouncements) => {
        const [isTracking, setIsTracking] = useState(false);

        const hasViewed = useCallback((announcement, currentUserId) => {
          if (!currentUserId || !announcement) return false;
          return hasUserViewed(currentUserId, announcement._id);
        }, []);

        const hasLiked = useCallback((announcement, currentUserId) => {
          if (!currentUserId || !announcement) return false;
          return hasUserLiked(currentUserId, announcement._id);
        }, []);

        const trackView = useCallback(async (announcementId, currentUserId) => {
          if (!currentUserId || isTracking) return;

          try {
            setIsTracking(true);
            
            if (hasUserViewed(currentUserId, announcementId)) {
              console.log("✅ User already viewed this announcement");
              return;
            }

              const userData = getRealUserData();
              
              const viewData = {
                userId: userData.userId,
                employeeId: userData.employeeId,
                userName: userData.fullName,
                userEmail: userData.userName,
                viewedAt: new Date().toISOString()
              };

              console.log("👁️ Tracking view:", viewData);

              saveUserInteraction(currentUserId, announcementId, 'views');

              const response = await api.post(`/announcements/${announcementId}/view`, viewData);
              console.log("✅ View tracking response:", response.data);
              
              setAnnouncements(prev => 
                prev.map(a => 
                  a._id === announcementId 
                    ? { 
                        ...a, 
                        views: [...(a.views || []), viewData]
                      }
                    : a
                )
              );

                } catch (error) {
                  console.error("❌ Error tracking view:", error);
                } finally {
                  setIsTracking(false);
                }
              }, [announcements, setAnnouncements, isTracking]);

              const handleLike = useCallback(async (announcementId, currentUserId) => {
                if (!currentUserId || isTracking) {
                  console.error("❌ No user ID available or already processing");
                  return;
                }

                try {
                  setIsTracking(true);
                  
                  if (hasUserLiked(currentUserId, announcementId)) {
                    console.log("✅ User already liked this announcement");
                    return;
                  }

                  const userData = getRealUserData();
                  
                  const likeData = {
                    userId: userData.userId,
                    employeeId: userData.employeeId,
                    userName: userData.fullName,
                    userEmail: userData.userName,
                    likedAt: new Date().toISOString()
                  };

                  console.log("💖 Sending like data:", likeData);

                  saveUserInteraction(currentUserId, announcementId, 'likes');

                  const response = await api.post(`/announcements/${announcementId}/acknowledge`, likeData);
                  console.log("✅ Like response:", response.data);
                  
                  setAnnouncements(prev => 
                    prev.map(a => 
                      a._id === announcementId 
                        ? { 
                            ...a, 
                            acknowledgements: [...(a.acknowledgements || []), likeData]
                          }
                        : a
                    )
                  );

                } catch (error) {
                  console.error("❌ Error adding like:", error);
                  console.error("Error details:", error.response?.data);
                } finally {
                  setIsTracking(false);
                }
              }, [announcements, setAnnouncements, isTracking]);

            const getViewCount = useCallback((announcement) => {
              if (!announcement.views) return 0;
              return Array.isArray(announcement.views) ? announcement.views.length : 0;
            }, []);

          const getLikeCount = useCallback((announcement) => {
            if (!announcement.acknowledgements) return 0;
            return Array.isArray(announcement.acknowledgements) ? announcement.acknowledgements.length : 0;
          }, []);

        return {
          isTracking,
                
      hasViewed,
      hasLiked,
    
    trackView,
    handleLike,

  getViewCount,
  getLikeCount
    
  };
};