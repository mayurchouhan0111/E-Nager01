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

const COLLECTION_NAME = 'noDuesCertificates';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

function generateAppNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `ND-${year}-${random}`;
}

function getLocalNoDuesCertificates() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('nd_no_dues_certificates');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalNoDuesCertificates(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('nd_no_dues_certificates', JSON.stringify(list));
  } catch (e) {}
}

function syncLocalRecord(record) {
  const list = getLocalNoDuesCertificates();
  const idx = list.findIndex(r => r.id === record.id || (record.applicationNo && r.applicationNo === record.applicationNo));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalNoDuesCertificates(list);
}

export async function saveNoDuesDraft(data, existingId = null) {
  const payload = {
    ...data,
    status: 'Draft',
    updatedAt: new Date().toISOString()
  };

  try {
    if (existingId) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      await updateDoc(docRef, sanitizeFirestorePayload(payload));
      syncLocalRecord({ ...payload, id: existingId });
      return { success: true, id: existingId };
    } else {
      const appNo = generateAppNumber();
      const newPayload = {
        ...payload,
        applicationNo: appNo,
        appliedAt: new Date().toISOString(),
        timeline: [
          {
            id: `t-${Date.now()}`,
            action: 'Draft Saved',
            status: 'Draft',
            performedBy: data.applicantDetails?.fullName || 'Citizen',
            role: 'Applicant',
            remarks: 'नो ड्यूज आवेदन ड्राफ्ट के रूप में सहेजा गया।',
            timestamp: new Date().toISOString()
          }
        ]
      };
      await ensureFirebaseAuth();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizeFirestorePayload({
        ...newPayload,
        createdAt: serverTimestamp()
      }));
      const resultObj = { id: docRef.id, ...newPayload };
      syncLocalRecord(resultObj);
      return { success: true, id: docRef.id, applicationNo: appNo };
    }
  } catch (error) {
    console.warn('[NoDuesService] Firestore error, saving locally:', error.message);
    const localId = existingId || `local-nd-${Date.now()}`;
    const appNo = data.applicationNo || generateAppNumber();
    const resultObj = {
      ...payload,
      id: localId,
      applicationNo: appNo,
      appliedAt: payload.appliedAt || new Date().toISOString()
    };
    syncLocalRecord(resultObj);
    return { success: true, id: localId, applicationNo: appNo };
  }
}

export async function submitNoDuesCertificate(data, existingId = null) {
  const now = new Date().toISOString();
  const citizen = getCurrentCitizen();

  const timelineEntry = {
    id: `t-${Date.now()}`,
    action: existingId ? 'Application Resubmitted' : 'Application Submitted',
    status: 'Submitted',
    performedBy: data.applicantDetails?.fullName || 'Applicant',
    role: 'Applicant',
    remarks: 'नो ड्यूज प्रमाण पत्र (Property Tax NOC) आवेदन सफलतापूर्वक प्रस्तुत किया गया।',
    timestamp: now
  };

  const localList = getLocalNoDuesCertificates();
  const existingLocal = existingId ? localList.find(r => r.id === existingId) : null;
  const existingTimeline = existingLocal?.timeline || [];

  const appNo = data.applicationNo || generateAppNumber();
  const userEmail = citizen?.email || data.applicantDetails?.email || '';
  const userUid = citizen?.uid || '';
  const userDisplayName = citizen?.displayName || data.applicantDetails?.fullName || '';

  const finalPayload = {
    ...data,
    applicationNo: appNo,
    userEmail,
    userUid,
    userDisplayName,
    status: 'Submitted',
    appliedAt: data.appliedAt || now,
    updatedAt: now,
    timeline: [...existingTimeline, timelineEntry]
  };

  let assignedId = existingId;

  try {
    await ensureFirebaseAuth();
    if (existingId && !String(existingId).startsWith('local-')) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      await setDoc(docRef, sanitizeFirestorePayload(finalPayload), { merge: true });
    } else {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizeFirestorePayload({
        ...finalPayload,
        createdAt: serverTimestamp()
      }));
      assignedId = docRef.id;
    }
  } catch (error) {
    console.warn('[NoDuesService] Firestore submission error, using local fallback:', error.message);
    if (!assignedId) assignedId = `local-nd-${Date.now()}`;
  }

  const finalRecord = { ...finalPayload, id: assignedId };
  syncLocalRecord(finalRecord);

  try {
    await sendNotification({
      serviceType: 'no_dues',
      applicationId: assignedId,
      applicationNo: appNo,
      userEmail,
      userUid,
      recipientId: data.applicantDetails?.mobile || 'citizen',
      event: 'APPLICATION_SUBMITTED',
      status: 'Submitted',
      message: `आपका नो ड्यूज प्रमाण पत्र (NOC) आवेदन (${appNo}) सफलतापूर्वक जमा हो गया है। 1 से 3 दिनों में भौतिक रसीद जमा करें।`,
      officerRemark: 'आवेदन समीक्षा हेतु लंबित है।'
    });
  } catch (e) {}

  return { 
    success: true, 
    id: assignedId, 
    applicationNo: appNo,
    message: 'नो ड्यूज प्रमाण पत्र आवेदन सफलतापूर्वक जमा किया गया!' 
  };
}

export async function getNoDuesCertificates(param1 = null, param2 = false) {
  let filterEmail = null;
  let isOfficer = false;

  if (typeof param1 === 'boolean') {
    isOfficer = param1;
    filterEmail = param2;
  } else {
    filterEmail = param1;
    isOfficer = Boolean(param2);
  }

  const citizen = getCurrentCitizen();
  const localItems = getLocalNoDuesCertificates();

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    const mergedMap = new Map();
    snap.docs.forEach(docSnap => {
      mergedMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
    });

    localItems.forEach(item => {
      const key = item.applicationNo || item.id;
      if (!mergedMap.has(key)) {
        mergedMap.set(item.id, item);
      }
    });

    let items = Array.from(mergedMap.values());

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
    saveLocalNoDuesCertificates(items);
    return items;
  } catch (error) {
    let items = localItems;
    if (!isOfficer) {
      const activeEmail = targetEmail || citizen?.email;
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
    return items;
  }
}

export async function updateNoDuesCertificateStatus({
  id,
  newStatus,
  remarks,
  officerName = 'Zonal Revenue Officer',
  certificateNo = null,
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
  const localList = getLocalNoDuesCertificates();
  const localObj = localList.find(r => r.id === id);
  if (localObj) existing = { ...localObj };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap && snap.exists()) {
      existing = { ...existing, ...snap.data() };
    }
  } catch (e) {}

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
    updatePayload.certificateNo = certificateNo || existing.certificateNo || `PT-NOC-0179-${Date.now().toString().slice(-5)}`;
  }

  await ensureFirebaseAuth();
  const fullRecord = sanitizeFirestorePayload({ ...existing, ...updatePayload, id });

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, fullRecord, { merge: true });
  } catch (error) {}

  syncLocalRecord(fullRecord);

  try {
    await sendNotification({
      serviceType: 'no_dues',
      applicationId: id,
      applicationNo: existing.applicationNo || '',
      userEmail: existing.userEmail || existing.applicantDetails?.email || '',
      userUid: existing.userUid || '',
      recipientId: existing.applicantDetails?.mobile || 'citizen',
      event: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      status: newStatus,
      message: `आपके नो ड्यूज प्रमाण पत्र (NOC) आवेदन (${existing.applicationNo || id}) की स्थिति बदलकर '${newStatus}' कर दी गई है।`,
      officerRemark: remarks.trim(),
      officerName
    });
  } catch (e) {}

  return { success: true, certificateNo: updatePayload.certificateNo };
}

export async function purgeAnonymousNoDuesCertificates() {
  if (typeof window !== 'undefined') {
    const list = getLocalNoDuesCertificates();
    const cleanList = list.filter(item => item.userEmail || item.userUid || item.applicantDetails?.email);
    saveLocalNoDuesCertificates(cleanList);
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
