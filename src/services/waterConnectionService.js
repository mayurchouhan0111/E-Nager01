import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { sendNotification } from './notificationService';

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
  const idx = list.findIndex(r => r.id === record.id);
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

export async function submitWaterConnection(data, existingId = null) {
  const isResubmission = Boolean(existingId && data.status === 'Correction Requested');
  const applicationNo = data.applicationNo || generateAppNumber();
  const now = new Date().toISOString();

  const timelineItem = {
    id: `t-${Date.now()}`,
    action: isResubmission ? 'Application Resubmitted' : 'Application Submitted',
    status: 'Submitted',
    performedBy: data.applicantDetails?.fullName || 'Citizen',
    role: 'Citizen',
    remarks: isResubmission 
      ? 'सुधार पश्चात जल कनेक्शन आवेदन पुनः प्रस्तुत किया गया (Resubmitted after correction)' 
      : 'जल कनेक्शन आवेदन प्रस्तुत किया गया (Water connection application submitted)',
    timestamp: now
  };

  let docId = existingId || `local-wc-${Date.now()}`;

  try {
    if (existingId) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      const existingSnap = await getDoc(docRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};
      const updatedTimeline = [...(existingData.timeline || []), timelineItem];

      const updateData = {
        ...data,
        applicationNo,
        status: 'Submitted',
        updatedAt: now,
        resubmittedAt: isResubmission ? now : existingData.resubmittedAt || null,
        timeline: updatedTimeline
      };
      await updateDoc(docRef, updateData);
      syncLocalRecord({ id: existingId, ...updateData });
    } else {
      const newDoc = {
        ...data,
        applicationNo,
        status: 'Submitted',
        appliedAt: now,
        updatedAt: now,
        createdAtServer: serverTimestamp(),
        timeline: [timelineItem]
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
      docId = docRef.id;
      syncLocalRecord({ id: docId, ...newDoc });
    }
  } catch (error) {
    console.warn('[WaterConnectionService] Firestore submit fallback to local storage:', error.message);
    const existingList = getLocalWaterConnections();
    const existingObj = existingList.find(r => r.id === docId) || {};
    const updatedTimeline = [...(existingObj.timeline || []), timelineItem];

    const localDoc = {
      ...existingObj,
      ...data,
      id: docId,
      applicationNo,
      status: 'Submitted',
      appliedAt: existingObj.appliedAt || now,
      updatedAt: now,
      resubmittedAt: isResubmission ? now : existingObj.resubmittedAt || null,
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
    message: `जल कनेक्शन आवेदन (${applicationNo}) सफलतापूर्वक जमा किया गया। (Water connection application submitted successfully.)`,
    officerRemark: '',
    officerName: 'Citizen System'
  });

  return { success: true, id: docId, applicationNo };
}

export async function getWaterConnections() {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const items = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    items.sort((a, b) => new Date(b.appliedAt || b.updatedAt || 0) - new Date(a.appliedAt || a.updatedAt || 0));
    saveLocalWaterConnections(items);
    return items;
  } catch (error) {
    console.warn('[WaterConnectionService] Firestore read fallback to local storage:', error.message);
    return getLocalWaterConnections();
  }
}

export async function updateWaterConnectionStatus({
  id,
  newStatus,
  remarks,
  officerName = 'Water Supply Officer',
  permitNo = null
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

  const isLocalId = !id || String(id).startsWith('local-');

  if (!isLocalId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snap = await getDoc(docRef);
      if (snap && snap.exists()) {
        existing = { ...existing, ...snap.data() };
      }
    } catch (e) {}
  }

  const oldStatus = existing.status || 'Submitted';
  const updatedTimeline = [...(existing.timeline || []), timelineEntry];

  const updatePayload = {
    status: newStatus,
    updatedAt: now,
    lastOfficerRemark: remarks.trim(),
    lastOfficerName: officerName,
    timeline: updatedTimeline
  };

  if (newStatus === 'Approved' || newStatus === 'Certificate Generated' || newStatus === 'Sanctioned' || newStatus === 'Completed') {
    updatePayload.approvedAt = existing.approvedAt || now;
    updatePayload.approvedBy = officerName;
    updatePayload.permitNo = permitNo || existing.permitNo || `WC-PERMIT-${Date.now().toString().slice(-6)}`;
  }

  if (!isLocalId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await setDoc(docRef, updatePayload, { merge: true });
    } catch (error) {
      console.warn('[WaterConnectionService] Status updated in local storage');
    }
  }

  syncLocalRecord({ id, ...existing, ...updatePayload });

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
