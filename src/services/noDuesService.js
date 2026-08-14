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
import { sendNotification, notifyDepartmentHeadOnNewSubmission } from './notificationService';
import { getCurrentCitizen, createOrUpdateLocalCitizenProfile } from './citizenAuthService';

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
  } catch (e) {
    try {
      const sanitized = list.map(item => {
        if (item.officialUploadedCertificate && item.officialUploadedCertificate.fileData && item.officialUploadedCertificate.fileData.length > 300000) {
          return {
            ...item,
            officialUploadedCertificate: {
              ...item.officialUploadedCertificate,
              fileData: item.officialUploadedCertificate.fileData.substring(0, 50000)
            }
          };
        }
        return item;
      });
      localStorage.setItem('nd_no_dues_certificates', JSON.stringify(sanitized));
    } catch (err) {}
  }
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
  let citizen = getCurrentCitizen();
  if (!citizen && data.applicantDetails) {
    citizen = createOrUpdateLocalCitizenProfile(data.applicantDetails);
  }

  const payload = {
    ...data,
    userEmail: citizen?.email || data.userEmail || data.applicantDetails?.email || null,
    userUid: citizen?.uid || data.userUid || null,
    userMobile: citizen?.mobile || data.applicantDetails?.mobile || null,
    userDisplayName: citizen?.displayName || data.userDisplayName || data.applicantDetails?.fullName || null,
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

      await sendNotification({
        serviceType: 'no_dues',
        applicationId: docRef.id,
        applicationNo: appNo,
        userEmail: payload.userEmail,
        userUid: payload.userUid,
        recipientId: payload.userEmail || 'citizen',
        event: 'DRAFT_SAVED',
        status: 'Draft',
        message: `📝 नो ड्यूज प्रमाण पत्र (NOC) प्रारूप (${appNo}) सहेजा गया।`,
        officerRemark: '',
        officerName: 'Citizen System'
      });

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

    await sendNotification({
      serviceType: 'no_dues',
      applicationId: localId,
      applicationNo: appNo,
      userEmail: payload.userEmail,
      userUid: payload.userUid,
      recipientId: payload.userEmail || 'citizen',
      event: 'DRAFT_SAVED',
      status: 'Draft',
      message: `📝 नो ड्यूज प्रमाण पत्र (NOC) प्रारूप (${appNo}) सहेजा गया।`,
      officerRemark: '',
      officerName: 'Citizen System'
    });

    return { success: true, id: localId, applicationNo: appNo };
  }
}

export async function submitNoDuesCertificate(data, existingId = null) {
  const now = new Date().toISOString();
  let citizen = getCurrentCitizen();
  if (!citizen && data.applicantDetails) {
    citizen = createOrUpdateLocalCitizenProfile(data.applicantDetails);
  }

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
  const userMobile = citizen?.mobile || data.applicantDetails?.mobile || '';
  const userDisplayName = citizen?.displayName || data.applicantDetails?.fullName || '';

  const finalPayload = {
    ...data,
    applicationNo: appNo,
    userEmail,
    userUid,
    userMobile,
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
      recipientId: userEmail || data.applicantDetails?.mobile || 'citizen',
      event: 'APPLICATION_SUBMITTED',
      status: 'Submitted',
      message: `आपका नो ड्यूज प्रमाण पत्र (NOC) आवेदन (${appNo}) सफलतापूर्वक जमा हो गया है। यह 100% ऑनलाइन सेवा है — कार्यालय में भौतिक कॉपी (Hard Copy) जमा करना अनिवार्य नहीं है।`,
      officerRemark: 'आवेदन समीक्षा हेतु लंबित है।'
    });
  } catch (e) {}

  notifyDepartmentHeadOnNewSubmission({
    serviceType: 'no_dues',
    applicationNo: appNo,
    applicantName: data.applicantDetails?.fullName || 'नागरिक',
    applicantMobile: data.applicantDetails?.mobile || 'N/A',
    applicantEmail: userEmail || 'N/A',
    details: data
  }).catch(e => console.warn('[NoDues] Officer notification dispatch error:', e));

  return { 
    success: true, 
    id: assignedId, 
    applicationNo: appNo,
    message: 'नो ड्यूज प्रमाण पत्र आवेदन सफलतापूर्वक जमा किया गया!' 
  };
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

  const cleanEmail = (str) => (str || '').toString().trim().toLowerCase();
  const cleanMobile = (str) => (str || '').toString().replace(/[\s-]/g, '');

  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

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
    });

    let items = Array.from(mergedMap.values());

    if (!isOfficer) {
      const activeEmail = cleanEmail(filterEmail || citizen?.email);
      const activeUid = citizen?.uid;
      const activeMobile = cleanMobile(citizen?.mobile);

      let derivedMobile = activeMobile;
      if (!derivedMobile && activeEmail) {
        const m = activeEmail.match(/^([6-9]\d{9})/);
        if (m) derivedMobile = m[1];
      }

      if (!activeEmail && !activeUid && !derivedMobile) {
        return localItems;
      }

      items = items.filter(item => {
        const isLocal = localItems.some(loc => loc.id === item.id || (item.applicationNo && loc.applicationNo === item.applicationNo));
        if (isLocal) return true;

        const itemEmail = cleanEmail(item.userEmail || item.applicantDetails?.email);
        const itemUid = item.userUid;
        const itemMobile = cleanMobile(item.userMobile || item.applicantDetails?.mobile);

        let itemDerivedMobile = itemMobile;
        if (!itemDerivedMobile && itemEmail) {
          const m = itemEmail.match(/^([6-9]\d{9})/);
          if (m) itemDerivedMobile = m[1];
        }

        const emailMatch = activeEmail && itemEmail && (itemEmail === activeEmail || itemEmail.includes(activeEmail) || activeEmail.includes(itemEmail));
        const uidMatch = activeUid && itemUid && itemUid === activeUid;
        const mobileMatch = derivedMobile && itemDerivedMobile && derivedMobile === itemDerivedMobile;

        return Boolean(emailMatch || uidMatch || mobileMatch);
      });
    }

    items.sort((a, b) => new Date(b.updatedAt || b.appliedAt || 0) - new Date(a.updatedAt || a.appliedAt || 0));
    saveLocalNoDuesCertificates(items);
    return items;
  } catch (error) {
    let items = localItems;
    if (!isOfficer) {
      const activeEmail = cleanEmail(filterEmail || citizen?.email);
      const activeUid = citizen?.uid;
      const activeMobile = cleanMobile(citizen?.mobile);

      let derivedMobile = activeMobile;
      if (!derivedMobile && activeEmail) {
        const m = activeEmail.match(/^([6-9]\d{9})/);
        if (m) derivedMobile = m[1];
      }

      if (!activeEmail && !activeUid && !derivedMobile) {
        return localItems;
      }

      items = items.filter(item => {
        const isLocal = localItems.some(loc => loc.id === item.id || (item.applicationNo && loc.applicationNo === item.applicationNo));
        if (isLocal) return true;

        const itemEmail = cleanEmail(item.userEmail || item.applicantDetails?.email);
        const itemUid = item.userUid;
        const itemMobile = cleanMobile(item.userMobile || item.applicantDetails?.mobile);

        let itemDerivedMobile = itemMobile;
        if (!itemDerivedMobile && itemEmail) {
          const m = itemEmail.match(/^([6-9]\d{9})/);
          if (m) itemDerivedMobile = m[1];
        }

        const emailMatch = activeEmail && itemEmail && (itemEmail === activeEmail || itemEmail.includes(activeEmail) || activeEmail.includes(itemEmail));
        const uidMatch = activeUid && itemUid && itemUid === activeUid;
        const mobileMatch = derivedMobile && itemDerivedMobile && derivedMobile === itemDerivedMobile;

        return Boolean(emailMatch || uidMatch || mobileMatch);
      });
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
  const localObj = localList.find(r => r.id === id || (r.applicationNo && r.applicationNo === id));
  if (localObj) existing = { ...localObj };

  const targetId = existing.id || id;

  try {
    const docRef = doc(db, COLLECTION_NAME, targetId);
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
  const fullRecord = sanitizeFirestorePayload({ ...existing, ...updatePayload, id: targetId });

  try {
    const docRef = doc(db, COLLECTION_NAME, targetId);
    await setDoc(docRef, fullRecord, { merge: true });
  } catch (error) {}

  syncLocalRecord(fullRecord);

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      serviceType: 'no_dues',
      applicationId: id,
      applicationNo: existing.applicationNo || 'N/A',
      user: officerName,
      role: 'nodues_admin',
      action: `STATUS_CHANGE_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
      oldStatus: existing.status || 'Submitted',
      newStatus,
      remarks: remarks.trim(),
      timestamp: now
    });
  } catch (e) {}

  try {
    await sendNotification({
      serviceType: 'no_dues',
      applicationId: id,
      applicationNo: existing.applicationNo || '',
      userEmail: existing.userEmail || existing.applicantDetails?.email || '',
      userUid: existing.userUid || '',
      recipientId: existing.userEmail || existing.applicantDetails?.email || existing.applicantDetails?.mobile || 'citizen',
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
