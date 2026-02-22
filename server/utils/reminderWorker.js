import Note from '../models/Note.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import PushSubscription from '../models/PushSubscription.js';
import { sendMail } from './mailer.js';
import webpush from 'web-push';

let intervalHandle = null;

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  if (publicKey && privateKey) {
    try {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      return true;
    } catch (err) {
      console.error('Failed to configure web-push', err.message || err);
    }
  }
  return false;
}

export default function startReminderWorker(intervalMs = 60000) {
  if (intervalHandle) return; // already running
  const webPushAvailable = configureWebPush();

  async function runOnce() {
    try {
      const now = new Date();
      // Find notes with reminder date <= now and not yet notified
      const due = await Note.find({
        'reminder.date': { $lte: now },
        'reminder.notified': false,
      }).limit(200).lean();

      if (!due || due.length === 0) return;

      for (const n of due) {
        try {
          // Mark reminder as notified
          await Note.findByIdAndUpdate(n._id, { 'reminder.notified': true });

          // Create a notification record
          await Notification.create({
            user: n.user,
            note: n._id,
            noteTitle: n.title || '',
            type: 'reminder',
            message: `Reminder for note: ${n.title || 'Untitled'}`,
            date: n.reminder && n.reminder.date ? n.reminder.date : now,
          });

          // Try to send email
          try {
            const user = await User.findById(n.user).select('+email').lean();
            if (user && user.email) {
              const subject = `Reminder: ${n.title || 'Untitled'}`;
              const text = `You have a reminder for your note: ${n.title || 'Untitled'}\n\n${n.content ? n.content.replace(/<[^>]+>/g, '').slice(0, 300) : ''}`;
              sendMail(user.email, subject, text, `<p>${text.replace(/\n/g, '<br/>')}</p>`).catch(() => {});
            }
          } catch (err) {
            console.error('Failed to send reminder email for note', n._id, err && err.message ? err.message : err);
          }

          // Try push notifications if configured
          if (webPushAvailable) {
            try {
              const subs = await PushSubscription.find({ user: n.user }).lean();
              const payload = JSON.stringify({ title: n.title || 'Reminder', body: `Reminder for your note: ${n.title || 'Untitled'}`, noteId: n._id });
              for (const s of subs) {
                try {
                  await webpush.sendNotification(s.subscription, payload);
                } catch (err) {
                  console.error('Web-push send failed, removing subscription', err && err.statusCode, err && err.body);
                  // best-effort: remove broken subscription
                  try { await PushSubscription.deleteOne({ _id: s._id }); } catch (e) {}
                }
              }
            } catch (err) {
              console.error('Failed to send push notifications for note', n._id, err && err.message ? err.message : err);
            }
          }

          console.log(`Reminder triggered for note ${n._id}`);
        } catch (err) {
          console.error('Failed to process reminder for note', n._id, err.message);
        }
      }
    } catch (error) {
      console.error('Reminder worker error:', error.message || error);
    }
  }

  // Run immediately then on interval
  runOnce().catch(err => console.error(err));
  intervalHandle = setInterval(() => runOnce().catch(err => console.error(err)), intervalMs);

  console.log('Reminder worker started (intervalMs=' + intervalMs + ')');

  return () => {
    if (intervalHandle) clearInterval(intervalHandle);
    intervalHandle = null;
  };
}
