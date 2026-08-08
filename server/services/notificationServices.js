import { Notification } from "../models/notification.js";

export const createNotification = async (notificationData) => {
  const notification = new Notification(notificationData);
  return await notification.save();
};

export const notifyUser= async(
    uderId,
    message,
    type="general",
    link=null,
    priority="low",
)=>{
   return await createNotification({
     user:uderId,
    message,
    type,
    link,
    priority,
   })
}
// mark as read
export const markAsRead = async (nptification, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true },
  );
};

// mark all As Read
export const markAllAsRead = async (notification, userId) => {
  return await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true },
  );
};

// delete notification
export const deleteNotification = async (notification, userId) => {
  return await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });
};