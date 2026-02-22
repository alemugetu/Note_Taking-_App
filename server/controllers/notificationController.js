import Notification from '../models/Notification.js';
import ErrorHandler from '../utils/errorHandler.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return next(new ErrorHandler('Not authorized', 401));

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    const id = req.params.id;
    if (!userId) return next(new ErrorHandler('Not authorized', 401));

    const notif = await Notification.findOne({ _id: id, user: userId });
    if (!notif) return next(new ErrorHandler('Notification not found', 404));

    notif.read = true;
    await notif.save();

    res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

export const markReadBulk = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    const ids = req.body.ids || [];
    if (!userId) return next(new ErrorHandler('Not authorized', 401));
    if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: true, updated: 0 });

    const result = await Notification.updateMany({ _id: { $in: ids }, user: userId }, { $set: { read: true } });
    res.json({ success: true, updated: result.nModified || result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
};

export const deleteBulk = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    const ids = req.body.ids || [];
    if (!userId) return next(new ErrorHandler('Not authorized', 401));
    if (!Array.isArray(ids) || ids.length === 0) return res.json({ success: true, deleted: 0 });

    const result = await Notification.deleteMany({ _id: { $in: ids }, user: userId });
    res.json({ success: true, deleted: result.deletedCount || 0 });
  } catch (error) {
    next(error);
  }
};
