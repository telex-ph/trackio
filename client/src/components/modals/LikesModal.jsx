import React from "react";
import { X, Heart } from "lucide-react";
import { DateTime } from "luxon";

const LikesModal = ({ isOpen, onClose, likes, announcementTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-scale-up">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold truncate">Announcement Likes</h3>
              <p className="text-red-100 text-xs sm:text-sm truncate">
                "{announcementTitle}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-white/90 px-2 py-1 rounded-full text-xs font-medium">
              {likes?.length || 0}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {likes && likes.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl sm:rounded-2xl shadow-lg border border-red-200 p-4">
                <h4 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="currentColor" />
                  Users Who Liked ({likes.length})
                </h4>
                <div className="grid gap-2">
                  {likes.map((like, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {like.userName ? like.userName.charAt(0).toUpperCase() : 
                           like.userId ? like.userId.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {like.userName || like.userId}
                          </p>
                            <p className="text-xs text-gray-500 truncate">
                              Viewed on {like.timestamp ? DateTime.fromISO(like.timestamp).toLocaleString(DateTime.DATETIME_MED) : 'Unknown date'}
                            </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-red-600 ml-2">
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                        <span className="text-xs font-medium hidden sm:inline">Liked</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-3" />
              <h4 className="text-lg font-semibold text-gray-600 mb-2 text-center">
                No Likes Yet
              </h4>
              <p className="text-gray-500 text-center text-sm">
                This announcement hasn't been liked by any users yet.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LikesModal;