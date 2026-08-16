import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

import { cleanHindiText } from '../utils/textSanitizer';
import { getCurrentCitizen } from './citizenAuthService';

const NOTIFICATIONS_COLLECTION = 'notifications';

function getCitizenNotifStorageKey() {
  if (typeof window === 'undefined') return 'dc_notifications_guest';
  const citizen = getCurrentCitizen();
  const raw = citizen?.email || citizen?.uid || 'guest';
  const safeKey = raw.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `dc_notifications_${safeKey}`;
}

function getLocalNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const key = getCitizenNotifStorageKey();
    const data = localStorage.getItem(key) || localStorage.getItem('dc_notifications');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalNotifications(list) {
  if (typeof window === 'undefined') return;
  try {
    const key = getCitizenNotifStorageKey();
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {}
}

function addLocalNotification(notif) {
  const list = getLocalNotifications();
  list.unshift(notif);
  saveLocalNotifications(list);
}

export async function sendNotification({
  serviceType = 'general',
  applicationId = '',
  applicationNo = '',
  recipientId = 'citizen',
  userEmail = '',
  userUid = '',
  event = 'STATUS_UPDATE',
  status = '',
  message = '',
  officerRemark = '',
  officerName = 'Nagar Palika Officer'
}) {
  const serviceTitleMap = {
    birth: 'जन्म प्रमाण पत्र (Birth Certificate)',
    death: 'मृत्यु प्रमाण पत्र (Death Certificate)',
    water_connection: 'जल (नल) कनेक्शन (Water Connection)',
    water: 'जल (नल) कनेक्शन (Water Connection)',
    no_dues: 'संपत्ति कर नो ड्यूज NOC (Property Tax NOC)'
  };
  const serviceTitle = serviceTitleMap[serviceType] || serviceType;

  const payload = {
    serviceType,
    applicationId,
    applicationNo,
    recipientId: userEmail || userUid || recipientId || 'citizen',
    userEmail: userEmail || '',
    userUid: userUid || '',
    event,
    status,
    title: `📢 आवेदन स्थिति अद्यतन: ${applicationNo || 'N/A'}`,
    message: message || `आपके ${serviceTitle} आवेदन (${applicationNo || ''}) की स्थिति '${status}' कर दी गई है।`,
    officerRemark: officerRemark || '',
    officerName: officerName || 'Nagar Palika Officer',
    isRead: false,
    timestamp: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...payload,
      createdAt: serverTimestamp()
    });
    addLocalNotification({ id: docRef.id, ...payload });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.warn('[Notification] Firestore send fallback to local storage:', error.message);
    const localId = `local-notif-${Date.now()}`;
    addLocalNotification({ id: localId, ...payload });
    return { success: true, id: localId };
  }
}

export function subscribeNotifications({ targetEmail = null, targetUid = null, recipientId = null, maxResults = 50 } = {}, callback) {
  if (!callback || typeof callback !== 'function') return () => {};

  try {
    const notifRef = collection(db, NOTIFICATIONS_COLLECTION);
    const unsubscribe = onSnapshot(notifRef, (snap) => {
      let notifications = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Email & UID Filtered Citizen / Officer Notifications
      if (targetEmail || targetUid) {
        notifications = notifications.filter(n => {
          if (n.recipientId === 'all' || n.recipientId === 'public') return true;
          if (targetEmail && (n.userEmail === targetEmail || n.recipientId === targetEmail)) return true;
          if (targetUid && (n.userUid === targetUid || n.recipientId === targetUid)) return true;
          return false;
        });
      } else if (recipientId) {
        notifications = notifications.filter(n => n.recipientId === recipientId || n.recipientId === 'all');
      }

      notifications.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
      const finalNotifs = notifications.slice(0, maxResults);
      saveLocalNotifications(finalNotifs);
      callback(finalNotifs);
    }, (error) => {
      console.warn('[Notification] Firestore snapshot error, using local storage fallback:', error.message);
      const local = getLocalNotifications();
      callback(local);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Notification] Subscribe error:', err.message);
    const local = getLocalNotifications();
    callback(local);
    return () => {};
  }
}

export async function getNotifications({ serviceType = null, targetEmail = null, targetUid = null, recipientId = null, maxResults = 50 } = {}) {
  try {
    const notifRef = collection(db, NOTIFICATIONS_COLLECTION);
    const snap = await getDocs(notifRef);

    let notifications = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    if (serviceType) {
      notifications = notifications.filter(n => n.serviceType === serviceType);
    }

    if (targetEmail || targetUid) {
      notifications = notifications.filter(n => {
        if (n.recipientId === 'all' || n.recipientId === 'public') return true;
        if (targetEmail && (n.userEmail === targetEmail || n.recipientId === targetEmail)) return true;
        if (targetUid && (n.userUid === targetUid || n.recipientId === targetUid)) return true;
        return false;
      });
    } else if (recipientId) {
      notifications = notifications.filter(n => n.recipientId === recipientId || n.recipientId === 'all');
    }

    notifications.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    saveLocalNotifications(notifications);
    return notifications.slice(0, maxResults);
  } catch (error) {
    console.warn('[Notification] Firestore read fallback to local storage:', error.message);
    let notifications = getLocalNotifications();
    if (serviceType) {
      notifications = notifications.filter(n => n.serviceType === serviceType);
    }
    if (targetEmail || targetUid) {
      notifications = notifications.filter(n => {
        if (n.recipientId === 'all' || n.recipientId === 'public') return true;
        if (targetEmail && (n.userEmail === targetEmail || n.recipientId === targetEmail)) return true;
        if (targetUid && (n.userUid === targetUid || n.recipientId === targetUid)) return true;
        return false;
      });
    } else if (recipientId) {
      notifications = notifications.filter(n => n.recipientId === recipientId || n.recipientId === 'all');
    }
    notifications.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    return notifications.slice(0, maxResults);
  }
}

export async function notifyDepartmentHeadOnNewSubmission({
  serviceType,
  applicationNo,
  applicantName = 'नागरिक',
  applicantMobile = 'N/A',
  applicantEmail = 'N/A',
  details = {}
}) {
  const serviceTitleMap = {
    birth: 'जन्म प्रमाण पत्र (Birth Certificate)',
    death: 'मृत्यु प्रमाण पत्र (Death Certificate)',
    water_connection: 'जल (नल) कनेक्शन (Water Connection)',
    water: 'जल (नल) कनेक्शन (Water Connection)',
    no_dues: 'संपत्ति कर नो ड्यूज NOC (Property Tax NOC)'
  };
  const serviceTitle = serviceTitleMap[serviceType] || serviceType;

  // In-App Notification for Officer Admin Portal
  const officerNotifPayload = {
    serviceType,
    applicationNo,
    recipientId: 'officer',
    isOfficerNotification: true,
    applicantName: cleanHindiText(applicantName),
    applicantMobile,
    applicantEmail,
    event: 'NEW_SUBMISSION',
    status: 'Submitted',
    title: `🚨 नया ऑनलाइन आवेदन प्राप्त: ${applicationNo}`,
    message: `[${serviceTitle}] हेतु नया आवेदन (${applicationNo}) नागरिक ${cleanHindiText(applicantName)} (मोबाइल: ${applicantMobile}) द्वारा जमा किया गया।`,
    details: details || {},
    timestamp: new Date().toISOString()
  };

  try {
    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), {
      ...officerNotifPayload,
      createdAt: serverTimestamp()
    });
    addLocalNotification({ id: docRef.id, ...officerNotifPayload });
  } catch (error) {
    const localId = `off-notif-${Date.now()}`;
    addLocalNotification({ id: localId, ...officerNotifPayload });
  }

  return { success: true };
}

export async function markNotificationAsRead(notificationId) {
  if (!notificationId) return true;
  try {
    const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(docRef, { isRead: true });
  } catch (error) {
    console.warn('[Notification] Error marking notification as read (local update fallback):', error.message);
  }

  const list = getLocalNotifications();
  const idx = list.findIndex(n => n.id === notificationId);
  if (idx >= 0) {
    list[idx].isRead = true;
    saveLocalNotifications(list);
  }
  return true;
}
