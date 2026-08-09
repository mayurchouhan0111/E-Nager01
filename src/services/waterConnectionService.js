import { db, ensureFirebaseAuth, sanitizeFirestorePayload } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { sendNotification } from './notificationService';
import { getCurrentCitizen } from './citizenAuthService';

const COLLECTION_NAME = 'waterConnections';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

function generateAppNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `WC-${year}-${random}`;
}

function getLocalWaterConnections() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('wc_water_connections');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalWaterConnections(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('wc_water_connections', JSON.stringify(list));
  } catch (e) {}
}

function syncLocalRecord(record) {
  const list = getLocalWaterConnections();
  const idx = list.findIndex(r => r.id === record.id || (record.applicationNo && r.applicationNo === record.applicationNo));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalWaterConnections(list);
}

export async function saveWaterConnectionDraft(data, existingId = null) {
  const payload = {
    ...data,
    status: 'Draft',
    updatedAt: new Date().toISOString()
  };

  try {
    if (existingId) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      await updateDoc(docRef, { ...payload, updatedAtServer: serverTimestamp() });
      syncLocalRecord({ id: existingId, ...payload });
      return { success: true, id: existingId, applicationNo: data.applicationNo };
    } else {
      const applicationNo = generateAppNumber();
      const newDoc = {
        ...payload,
        applicationNo,
        appliedAt: new Date().toISOString(),
        createdAtServer: serverTimestamp(),
        timeline: [
          {
            id: 't-1',
            action: 'Draft Saved',
            status: 'Draft',
            performedBy: data.applicantDetails?.fullName || 'Citizen',
            role: 'Citizen',
            remarks: 'जल कनेक्शन आवेदन प्रारूप सहेजा गया (Draft saved by citizen)',
            timestamp: new Date().toISOString()
          }
        ]
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
      syncLocalRecord({ id: docRef.id, ...newDoc });

      await sendNotification({
        serviceType: 'water_connection',
        applicationId: docRef.id,
        applicationNo,
        recipientId: 'all',
        event: 'DRAFT_SAVED',
        status: 'Draft',
        message: `📝 जल कनेक्शन आवेदन प्रारूप (${applicationNo}) सहेजा गया। (Water connection draft saved.)`,
        officerRemark: '',
        officerName: 'Citizen System'
      });

      return { success: true, id: docRef.id, applicationNo };
    }
  } catch (error) {
    console.warn('[WaterConnectionService] Firestore fallback to local storage:', error.message);
    const localId = existingId || `local-wc-${Date.now()}`;
    const applicationNo = data.applicationNo || generateAppNumber();
    const localDoc = {
      ...payload,
      id: localId,
      applicationNo,
      appliedAt: data.appliedAt || new Date().toISOString(),
      timeline: data.timeline || [
        {
          id: 't-1',
          action: 'Draft Saved',
          status: 'Draft',
          performedBy: data.applicantDetails?.fullName || 'Citizen',
          role: 'Citizen',
          remarks: 'जल कनेक्शन आवेदन प्रारूप सहेजा गया (Draft saved locally)',
          timestamp: new Date().toISOString()
        }
      ]
    };
    syncLocalRecord(localDoc);

    await sendNotification({
      serviceType: 'water_connection',
      applicationId: localId,
      applicationNo,
      recipientId: 'all',
      event: 'DRAFT_SAVED',
      status: 'Draft',
      message: `📝 जल कनेक्शन आवेदन प्रारूप (${applicationNo}) सहेजा गया। (Water connection draft saved.)`,
      officerRemark: '',
      officerName: 'Citizen System'
    });

    return { success: true, id: localId, applicationNo };
  }
}

import { formatOfficialDocumentVault } from '../utils/documentVault';

export async function submitWaterConnection(data, existingId = null) {
  const applicationNo = data.applicationNo || generateAppNumber();
  const isResubmission = Boolean(existingId || data.applicationNo || data.status === 'Correction Requested');
  const now = new Date().toISOString();
  const citizen = getCurrentCitizen();

  const formattedDocuments = formatOfficialDocumentVault(data.documents, applicationNo, 'water_connection');
  const processedData = {
    ...data,
    userEmail: citizen?.email || data.userEmail || null,
    userUid: citizen?.uid || data.userUid || null,
    userDisplayName: citizen?.displayName || data.userDisplayName || null,
    documents: formattedDocuments,
    documentVaultPath: `applications/water_connection/${new Date().getFullYear()}/${applicationNo}/documents/`
  };

  const timelineItem = {
    id: `t-${Date.now()}`,
    action: isResubmission ? 'Application Resubmitted' : 'Application Submitted',
    status: 'Submitted',
    performedBy: data.applicantDetails?.fullName || citizen?.displayName || 'Citizen',
    role: 'Citizen',
    remarks: isResubmission 
      ? 'अधिकारी की टिप्पणी अनुसार सुधार कर जल कनेक्शन आवेदन पुनः प्रस्तुत किया गया (Resubmitted after correction)' 
      : 'जल कनेक्शन आवेदन प्रस्तुत किया गया (Water connection application submitted)',
    timestamp: now
  };

  let docRef = null;
  let docId = existingId;
  let existingData = {};

  try {
    const q = query(collection(db, COLLECTION_NAME), where('applicationNo', '==', applicationNo));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      docRef = existingDoc.ref;
      docId = existingDoc.id;
      existingData = existingDoc.data() || {};
    } else if (existingId) {
      docRef = doc(db, COLLECTION_NAME, existingId);
      const existingSnap = await getDoc(docRef).catch(() => null);
      if (existingSnap && existingSnap.exists()) {
        existingData = existingSnap.data() || {};
      }
    }

    const updatedTimeline = [...(existingData.timeline || []), timelineItem];

    const finalDoc = {
      ...existingData,
      ...processedData,
      id: docId || (docRef ? docRef.id : `wc-${Date.now()}`),
      applicationNo,
      status: 'Submitted',
      isResubmitted: isResubmission,
      appliedAt: existingData.appliedAt || now,
      updatedAt: now,
      resubmittedAt: isResubmission ? now : (existingData.resubmittedAt || null),
      timeline: updatedTimeline
    };

    const sanitizedPayload = sanitizeFirestorePayload(finalDoc);

    if (docRef) {
      await setDoc(docRef, sanitizedPayload, { merge: true });
    } else {
      const newRef = doc(collection(db, COLLECTION_NAME));
      finalDoc.id = newRef.id;
      docId = newRef.id;
      await setDoc(newRef, sanitizeFirestorePayload(finalDoc), { merge: true });
    }

    syncLocalRecord(finalDoc);
  } catch (error) {
    console.warn('[WaterConnectionService] Firestore submit fallback to local storage:', error.message);
    const existingList = getLocalWaterConnections();
    const existingObj = existingList.find(r => r.applicationNo === applicationNo || r.id === docId) || {};
    const updatedTimeline = [...(existingObj.timeline || []), timelineItem];

    const localDoc = {
      ...existingObj,
      ...data,
      id: existingObj.id || docId || `local-wc-${Date.now()}`,
      applicationNo,
      status: 'Submitted',
      isResubmitted: isResubmission,
      appliedAt: existingObj.appliedAt || now,
      updatedAt: now,
      resubmittedAt: isResubmission ? now : (existingObj.resubmittedAt || null),
      timeline: updatedTimeline
    };
    syncLocalRecord(localDoc);
  }

  await sendNotification({
    serviceType: 'water_connection',
    applicationId: docId,
    applicationNo,
    recipientId: 'all',
    event: isResubmission ? 'APPLICATION_RESUBMITTED' : 'APPLICATION_SUBMITTED',
    status: 'Submitted',
    message: isResubmission 
      ? `🔄 जल कनेक्शन आवेदन (${applicationNo}) में आवेदक द्वारा सुधार कर पुनः जमा किया गया।` 
      : `जल कनेक्शन आवेदन (${applicationNo}) सफलतापूर्वक जमा किया गया।`,
    officerRemark: '',
    officerName: 'Citizen System'
  });

  return { success: true, id: docId, applicationNo };
}

const STATUS_PRIORITY = {
  'Approved': 5,
  'Certificate Generated': 5,
  'Completed': 5,
  'Sanctioned': 5,
  'Rejected': 4,
  'Correction Requested': 4,
  'Under Review': 3,
  'Submitted': 2,
  'Draft': 1
};

function mergeRecords(existing, incoming) {
  if (!existing) return incoming;
  if (!incoming) return existing;

  const existingPrio = STATUS_PRIORITY[existing.status] || 0;
  const incomingPrio = STATUS_PRIORITY[incoming.status] || 0;

  if (incomingPrio > existingPrio) {
    return { ...existing, ...incoming };
  } else if (incomingPrio < existingPrio) {
    return { ...incoming, ...existing };
  } else {
    const existingTime = new Date(existing.updatedAt || existing.appliedAt || 0).getTime();
    const incomingTime = new Date(incoming.updatedAt || incoming.appliedAt || 0).getTime();
    return incomingTime >= existingTime ? { ...existing, ...incoming } : { ...incoming, ...existing };
  }
}

export async function getWaterConnections(filterEmail = null, isOfficer = false) {
  const citizen = getCurrentCitizen();
  const targetEmail = isOfficer ? null : (filterEmail || citizen?.email);
  const localItems = getLocalWaterConnections();

  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const remoteItems = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const mergedMap = new Map();
    remoteItems.forEach(item => {
      const key = item.applicationNo || item.id;
      const existing = mergedMap.get(key);
      mergedMap.set(key, mergeRecords(existing, item));
    });

    localItems.forEach(item => {
      const key = item.applicationNo || item.id;
      const existingRemote = mergedMap.get(key) || mergedMap.get(item.id);
      const merged = mergeRecords(existingRemote, item);
      mergedMap.set(key, merged);

      if (item.id && item.status && item.status !== 'Draft') {
        try {
          const docRef = doc(db, COLLECTION_NAME, item.id);
          setDoc(docRef, sanitizeFirestorePayload(merged), { merge: true }).catch(() => {});
        } catch (e) {}
      }
    });

    let items = Array.from(mergedMap.values());

    // Strict Citizen Isolation: If not officer, filter by current citizen email/uid. If not logged in, return []
    if (!isOfficer) {
      const activeEmail = filterEmail || citizen?.email;
      const activeUid = citizen?.uid;

      if (!activeEmail && !activeUid) {
        return [];
      }

      items = items.filter(item => 
        (activeEmail && (item.userEmail === activeEmail || item.applicantDetails?.email === activeEmail)) ||
        (activeUid && item.userUid === activeUid)
      );
    }

    items.sort((a, b) => new Date(b.updatedAt || b.appliedAt || 0) - new Date(a.updatedAt || a.appliedAt || 0));
    saveLocalWaterConnections(items);
    return items;
  } catch (error) {
    console.warn('[WaterConnectionService] Firestore read fallback to local storage:', error.message);
    let items = localItems;
    if (!isOfficer) {
      const activeEmail = filterEmail || citizen?.email;
      const activeUid = citizen?.uid;

      if (!activeEmail && !activeUid) {
        return [];
      }

      items = items.filter(item => 
        (activeEmail && (item.userEmail === activeEmail || item.applicantDetails?.email === activeEmail)) ||
        (activeUid && item.userUid === activeUid)
      );
    }
    return items;
  }
}

export async function updateWaterConnectionStatus({
  id,
  newStatus,
  remarks,
  officerName = 'Water Supply Officer',
  permitNo = null,
  officialUploadedCertificate = null
}) {
  if (!remarks || !remarks.trim()) {
    return { success: false, error: 'अधिकारी टिप्पणी आवश्यक है (Mandatory officer remark required)' };
  }

  const now = new Date().toISOString();
  const timelineEntry = {
    id: `t-${Date.now()}`,
    action: `Status Changed to ${newStatus}`,
    status: newStatus,
    performedBy: officerName,
    role: 'Officer',
    remarks: remarks.trim(),
    timestamp: now
  };

  let existing = {};
  const localList = getLocalWaterConnections();
  const localObj = localList.find(r => r.id === id);
  if (localObj) existing = { ...localObj };

  const isLocalId = !id || String(id).startsWith('local-');

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap && snap.exists()) {
      existing = { ...existing, ...snap.data() };
    }
  } catch (e) {}

  const oldStatus = existing.status || 'Submitted';
  const updatedTimeline = [...(existing.timeline || []), timelineEntry];

  const updatePayload = {
    status: newStatus,
    updatedAt: now,
    lastOfficerRemark: remarks.trim(),
    lastOfficerName: officerName,
    timeline: updatedTimeline
  };

  if (officialUploadedCertificate) {
    updatePayload.officialUploadedCertificate = officialUploadedCertificate;
  }

  if (newStatus === 'Approved' || newStatus === 'Certificate Generated' || newStatus === 'Sanctioned' || newStatus === 'Completed') {
    updatePayload.approvedAt = existing.approvedAt || now;
    updatePayload.approvedBy = officerName;
    updatePayload.permitNo = permitNo || existing.permitNo || `WC-PERMIT-${Date.now().toString().slice(-6)}`;
  }

  await ensureFirebaseAuth();
  const fullRecord = sanitizeFirestorePayload({ ...existing, ...updatePayload, id });

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, fullRecord, { merge: true });
    console.log('[WaterConnectionService] Status successfully updated in Firestore backend:', newStatus);
  } catch (error) {
    console.error('[WaterConnectionService] Firestore setDoc error:', error.message);
  }

  syncLocalRecord(fullRecord);

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      serviceType: 'water_connection',
      applicationId: id,
      applicationNo: existing.applicationNo || 'N/A',
      user: officerName,
      role: 'Officer',
      action: `STATUS_CHANGE_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      oldStatus,
      newStatus,
      remarks: remarks.trim(),
      timestamp: now
    });
  } catch (e) {}

  let notificationMsg = `आपका जल कनेक्शन आवेदन (${existing.applicationNo || id}) की स्थिति बदलकर ${newStatus} कर दी गई है।`;
  if (newStatus === 'Under Review') {
    notificationMsg = `🔍 आपका जल कनेक्शन आवेदन (${existing.applicationNo || id}) अब समीक्षा में है।`;
  } else if (newStatus === 'Correction Requested') {
    notificationMsg = `⚠ आपके जल कनेक्शन आवेदन (${existing.applicationNo || id}) में सुधार की आवश्यकता है। कारण: ${remarks.trim()}`;
  } else if (newStatus === 'Rejected') {
    notificationMsg = `❌ आपका जल कनेक्शन आवेदन (${existing.applicationNo || id}) निरस्त कर दिया गया है। कारण: ${remarks.trim()}`;
  } else if (newStatus === 'Approved' || newStatus === 'Sanctioned') {
    notificationMsg = `✅ आपका जल कनेक्शन आवेदन (${existing.applicationNo || id}) स्वीकृत एवं कनेक्शन स्वीकृति पत्र जारी कर दिया गया है!`;
  }

  await sendNotification({
    serviceType: 'water_connection',
    applicationId: id,
    applicationNo: existing.applicationNo || '',
    recipientId: existing.applicantDetails?.mobile || 'citizen',
    event: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
    status: newStatus,
    message: notificationMsg,
    officerRemark: remarks.trim(),
    officerName
  });

  return { success: true, permitNo: updatePayload.permitNo };
}

export async function purgeAnonymousWaterConnections() {
  if (typeof window !== 'undefined') {
    const list = getLocalWaterConnections();
    const cleanList = list.filter(item => item.userEmail || item.userUid || item.applicantDetails?.email);
    saveLocalWaterConnections(cleanList);
  }
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const deletePromises = [];
    snap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.userEmail && !data.userUid && (!data.applicantDetails || !data.applicantDetails.email)) {
        deletePromises.push(deleteDoc(doc(db, COLLECTION_NAME, docSnap.id)));
      }
    });
    await Promise.all(deletePromises);
    return { success: true, count: deletePromises.length };
  } catch (e) {
    return { success: false, error: e.message };
  }
}
