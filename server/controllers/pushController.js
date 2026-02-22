import PushSubscription from '../models/PushSubscription.js';
import ErrorHandler from '../utils/errorHandler.js';

export const saveSubscription = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return next(new ErrorHandler('Not authorized', 401));

    const sub = req.body.subscription;
    if (!sub) return next(new ErrorHandler('Subscription required', 400));

    // Upsert subscription for this user
    const existing = await PushSubscription.findOne({ user: userId });
    if (existing) {
      existing.subscription = sub;
      await existing.save();
      return res.json({ success: true, data: existing });
    }

    const created = await PushSubscription.create({ user: userId, subscription: sub });
    res.json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return next(new ErrorHandler('Not authorized', 401));
    await PushSubscription.deleteMany({ user: userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getVapidKey = async (req, res, next) => {
  try {
    const key = process.env.VAPID_PUBLIC_KEY || null;
    // Important: 204 responses should not include a body. Return 200 with null instead,
    // so the client can reliably detect missing configuration.
    if (!key) return res.status(200).json({ success: true, data: { publicKey: null } });
    return res.status(200).json({ success: true, data: { publicKey: key } });
  } catch (err) {
    next(err);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return next(new ErrorHandler('Not authorized', 401));

    const sub = await PushSubscription.findOne({ user: userId }).lean();
    if (!sub) return res.json({ success: true, data: null });
    res.json({ success: true, data: sub });
  } catch (err) {
    next(err);
  }
};
