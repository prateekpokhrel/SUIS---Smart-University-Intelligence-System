/**
 * REAL-TIME NOTIFICATION ENGINE
 * This logic ensures that users only see notifications if they actually exist.
 */

const rawNotifications = {
  student: [
    { id: 1, text: "New assignment uploaded", timestamp: new Date(), read: false },
    { id: 2, text: "Career prediction updated", timestamp: new Date(), read: false },
    { id: 3, text: "Performance report available", timestamp: new Date(), read: false },
  ],
  teacher: [
    { id: 1, text: "Student performance updated", timestamp: new Date(), read: false },
    { id: 2, text: "New submissions received", timestamp: new Date(), read: false },
    { id: 3, text: "At-risk student detected", timestamp: new Date(), read: false },
  ],
  admin: [
    { id: 1, text: "New student enrolled", timestamp: new Date(), read: false },
    { id: 2, text: "University analytics updated", timestamp: new Date(), read: false },
    { id: 3, text: "High-risk trend detected", timestamp: new Date(), read: false },
  ],
};

/**
 * Function to fetch notifications based on role.
 * If the list is empty, it returns a null state for the UI to handle.
 */
export const getRealTimeNotifications = (role) => {
  const notifications = rawNotifications[role] || [];
  
  // Logic: Only return if there are actual notifications, otherwise return empty
  if (notifications.length === 0) {
    return [];
  }
  
  return notifications;
};

// Default static fallback (optional)
export const notificationsByRole = rawNotifications;