import { useState, useCallback } from 'react';
import api from '../utils/axios';
import { hasUserViewed, hasUserLiked } from '../utils/announcementUtils';
import { useStore } from '../store/useStore';
export const useAnnouncementInteractions = (announcements, setAnnouncements) => {

  const [isTracking, setIsTracking] = useState(false);

  const hasViewed = useCallback(
    async (announcement, currentUserId) => {

    if (!currentUserId || !announcement) return false;
    return await hasUserViewed(announcement, currentUserId);
  }, []);

  const hasLiked = useCallback(async (announcement, currentUserId) => {
    if (!currentUserId || !announcement) return false;
    return await hasUserLiked(announcement, currentUserId);
  }, []);

  const trackView = useCallback(async (announcementId, currentUserId) => {
    const { user: zustandUser } = useStore.getState();
    
    const effectiveUserId = zustandUser?._id || currentUserId;
    const effectiveUserName = zustandUser ? `${zustandUser.firstName} ${zustandUser.lastName}`.trim() : 'Unknown User';
    
    if (!effectiveUserId || isTracking) return;

    try {
      setIsTracking(true);
      
      const announcement = announcements.find(a => a._id === announcementId);
      const alreadyViewed = await hasUserViewed(announcement, effectiveUserId);
      
      if (alreadyViewed) {
        console.log("✅ User already viewed this announcement");
        return;
      }

      const viewData = {
        userId: effectiveUserId,
        employeeId: zustandUser?.employeeId,
        userName: effectiveUserName,
        userEmail: zustandUser?.email,
        viewedAt: new Date().toISOString()
      };

      console.log("👁️ Tracking view in DATABASE:", viewData);

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
    console.log('LIKE INITIATED:', { 
      announcementId, 
      currentUserId,
      timestamp: new Date().toISOString()
    });

    const { user: zustandUser } = useStore.getState();
    const effectiveUserId = zustandUser?._id || currentUserId;
    
    console.log(' EFFECTIVE USER:', { effectiveUserId });

    if (!effectiveUserId || isTracking) {
      console.error(" Cannot like: No user ID or already processing");
      return;
    }

    try {
      setIsTracking(true);

      const announcement = announcements.find(a => a._id === announcementId);
      const alreadyLiked = announcement?.acknowledgements?.some(
        ack => ack.userId === effectiveUserId
      );
      
      console.log('ALREADY LIKED CHECK:', { 
        alreadyLiked, 
        effectiveUserId,
        currentAcknowledgements: announcement?.acknowledgements 
      });

      if (alreadyLiked) {
        console.log("✅ User already liked this announcement");
        return;
      }

      const effectiveUserName = zustandUser ? 
        `${zustandUser.firstName} ${zustandUser.lastName}`.trim() : 
        'Unknown User';

      const likeData = {
        userId: effectiveUserId,
        employeeId: zustandUser?.employeeId,
        userName: effectiveUserName,
        userEmail: zustandUser?.email,
        acknowledgedAt: new Date().toISOString()
      };

      console.log("💖 SENDING LIKE TO API:", likeData);

      const response = await api.post(`/announcements/${announcementId}/acknowledge`, likeData);
      console.log("✅ LIKE API RESPONSE:", response.data);
      
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

      console.log("✅ LIKE SUCCESS - STATE UPDATED");

    } catch (error) {
      console.error("❌ ERROR IN handleLike:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setIsTracking(false);
    }
  }, [announcements, setAnnouncements, isTracking]);

  const getViewCount = useCallback((announcement) => {
    if (!announcement?.views) return 0;
    return Array.isArray(announcement.views) ? announcement.views.length : 0;
  }, []);

  const getLikeCount = useCallback((announcement) => {
    if (!announcement?.acknowledgements) return 0;
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