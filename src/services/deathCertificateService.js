import { db, ensureFirebaseAuth, sanitizeFirestorePayload } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query,
  where,
  updateDoc, 
  setDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { sendNotification, notifyDepartmentHeadOnNewSubmission } from './notificationService';
import { getCurrentCitizen, createOrUpdateLocalCitizenProfile } from './citizenAuthService';

const COLLECTION_NAME = 'deathCertificates';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

function generateAppNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `DC-${year}-${random}`;
}

function getLocalDeathCertificates() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('dc_death_certificates');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalDeathCertificates(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('dc_death_certificates', JSON.stringify(list));
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
      localStorage.setItem('dc_death_certificates', JSON.stringify(sanitized));
    } catch (err) {}
  }
}

function syncLocalRecord(record) {
  const list = getLocalDeathCertificates();
  const idx = list.findIndex(r => r.id === record.id || (record.applicationNo && r.applicationNo === record.applicationNo));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalDeathCertificates(list);
}

export async function saveDeathCertificateDraft(data, existingId = null) {
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
      await updateDoc(docRef, sanitizeFirestorePayload({ ...payload, updatedAtServer: serverTimestamp() }));
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
            remarks: 'प्रारूप सहेजा गया (Draft saved by citizen)',
            timestamp: new Date().toISOString()
          }
        ]
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), sanitizeFirestorePayload(newDoc));
      syncLocalRecord({ id: docRef.id, ...newDoc });

      await sendNotification({
        serviceType: 'death_certificate',
        applicationId: docRef.id,
        applicationNo,
        userEmail: payload.userEmail,
        userUid: payload.userUid,
        recipientId: payload.userEmail || 'citizen',
        event: 'DRAFT_SAVED',
        status: 'Draft',
        message: `📝 मृतक प्रमाण पत्र प्रारूप (${applicationNo}) सहेजा गया। (Death certificate draft saved.)`,
        officerRemark: '',
        officerName: 'Citizen System'
      });

      return { success: true, id: docRef.id, applicationNo };
    }
  } catch (error) {
    console.warn('[DeathCertificateService] Firestore fallback to local storage:', error.message);
    const localId = existingId || `local-dc-${Date.now()}`;
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
          remarks: 'प्रारूप सहेजा गया (Draft saved locally)',
          timestamp: new Date().toISOString()
        }
      ]
    };
    syncLocalRecord(localDoc);

    await sendNotification({
      serviceType: 'death_certificate',
      applicationId: localId,
      applicationNo,
      recipientId: 'all',
      event: 'DRAFT_SAVED',
      status: 'Draft',
      message: `📝 मृतक प्रमाण पत्र प्रारूप (${applicationNo}) सहेजा गया। (Death certificate draft saved.)`,
      officerRemark: '',
      officerName: 'Citizen System'
    });

    return { success: true, id: localId, applicationNo };
  }
}

import { formatOfficialDocumentVault } from '../utils/documentVault';

export async function submitDeathCertificate(data, existingId = null) {
  const applicationNo = data.applicationNo || generateAppNumber();
  const isResubmission = Boolean(existingId || data.applicationNo || data.status === 'Correction Requested');
  const now = new Date().toISOString();
  let citizen = getCurrentCitizen();
  if (!citizen && data.applicantDetails) {
    citizen = createOrUpdateLocalCitizenProfile(data.applicantDetails);
  }

  const formattedDocuments = formatOfficialDocumentVault(data.documents, applicationNo, 'death_certificate');
  const processedData = {
    ...data,
    userEmail: citizen?.email || data.userEmail || data.applicantDetails?.email || null,
    userUid: citizen?.uid || data.userUid || null,
    userMobile: citizen?.mobile || data.applicantDetails?.mobile || null,
    userDisplayName: citizen?.displayName || data.userDisplayName || data.applicantDetails?.fullName || null,
    documents: formattedDocuments,
    documentVaultPath: `applications/death_certificate/${new Date().getFullYear()}/${applicationNo}/documents/`
  };

  const timelineItem = {
    id: `t-${Date.now()}`,
    action: isResubmission ? 'Application Resubmitted' : 'Application Submitted',
    status: 'Submitted',
    performedBy: data.applicantDetails?.fullName || citizen?.displayName || 'Citizen',
    role: 'Citizen',
    remarks: isResubmission 
      ? 'अधिकारी की टिप्पणी अनुसार सुधार कर आवेदन पुनः प्रस्तुत किया गया (Resubmitted after correction)' 
      : 'आवेदन प्रस्तुत किया गया (Application submitted)',
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
      id: docId || (docRef ? docRef.id : `dc-${Date.now()}`),
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
    console.warn('[DeathCertificateService] Firestore submit fallback to local storage:', error.message);
    const existingList = getLocalDeathCertificates();
    const existingObj = existingList.find(r => r.applicationNo === applicationNo || r.id === docId) || {};
    const updatedTimeline = [...(existingObj.timeline || []), timelineItem];

    const localDoc = {
      ...existingObj,
      ...data,
      id: existingObj.id || docId || `local-dc-${Date.now()}`,
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
    serviceType: 'death_certificate',
    applicationId: docId,
    applicationNo,
    userEmail: processedData.userEmail,
    recipientId: 'all',
    event: isResubmission ? 'APPLICATION_RESUBMITTED' : 'APPLICATION_SUBMITTED',
    status: 'Submitted',
    message: isResubmission 
      ? `🔄 मृत्यु प्रमाण पत्र आवेदन (${applicationNo}) में आवेदक द्वारा सुधार कर पुनः जमा किया गया।` 
      : `मृतक प्रमाण पत्र आवेदन (${applicationNo}) सफलतापूर्वक जमा किया गया।`,
    officerRemark: '',
    officerName: 'Citizen System'
  });

  notifyDepartmentHeadOnNewSubmission({
    serviceType: 'death',
    applicationNo,
    applicantName: data.applicantDetails?.fullName || 'नागरिक',
    applicantMobile: data.applicantDetails?.mobile || 'N/A',
    applicantEmail: processedData.userEmail || 'N/A',
    details: data
  }).catch(e => console.warn('[Death] Officer notification dispatch error:', e));

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

  let merged;
  if (incomingPrio > existingPrio) {
    merged = { ...existing, ...incoming };
  } else if (incomingPrio < existingPrio) {
    merged = { ...incoming, ...existing };
  } else {
    const existingTime = new Date(existing.updatedAt || existing.appliedAt || 0).getTime();
    const incomingTime = new Date(incoming.updatedAt || incoming.appliedAt || 0).getTime();
    merged = incomingTime >= existingTime ? { ...existing, ...incoming } : { ...incoming, ...existing };
  }

  return {
    ...merged,
    officialUploadedCertificate: incoming.officialUploadedCertificate || existing.officialUploadedCertificate || null
  };
}

export async function getDeathCertificates(filterEmail = null, isOfficer = false) {
  const citizen = getCurrentCitizen();
  const localItems = getLocalDeathCertificates();

  const cleanEmail = (str) => (str || '').toString().trim().toLowerCase();
  const cleanMobile = (str) => (str || '').toString().replace(/[\s-]/g, '');

  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const remoteItems = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const mergedMap = new Map();

    const findExistingKey = (item) => {
      if (item.applicationNo && mergedMap.has(item.applicationNo)) return item.applicationNo;
      if (item.id && mergedMap.has(item.id)) return item.id;
      for (const [k, existing] of mergedMap.entries()) {
        if (item.applicationNo && existing.applicationNo && existing.applicationNo === item.applicationNo) return k;
        if (item.id && (existing.id === item.id || k === item.id)) return k;
      }
      return null;
    };

    remoteItems.forEach(item => {
      const key = findExistingKey(item) || item.applicationNo || item.id;
      const existing = mergedMap.get(key);
      mergedMap.set(key, mergeRecords(existing, item));
    });

    localItems.forEach(item => {
      const key = findExistingKey(item) || item.applicationNo || item.id;
      const existingRemote = mergedMap.get(key);
      const merged = mergeRecords(existingRemote, item);
      mergedMap.set(key, merged);
    });

    let items = Array.from(mergedMap.values());

    if (!isOfficer) {
      const activeEmail = cleanEmail(filterEmail || citizen?.email);
      const activeUid = citizen?.uid;
      const activeMobile = cleanMobile(citizen?.mobile);
      const activeName = cleanEmail(citizen?.displayName);

      let derivedMobile = activeMobile;
      if (!derivedMobile && activeEmail) {
        const m = activeEmail.match(/^([6-9]\d{9})/);
        if (m) derivedMobile = m[1];
      }

      if (!activeEmail && !activeUid && !derivedMobile && !activeName) {
        items.sort((a, b) => new Date(b.updatedAt || b.appliedAt || b.createdAt || 0) - new Date(a.updatedAt || a.appliedAt || a.createdAt || 0));
        saveLocalDeathCertificates(items);
        return items;
      }

      items = items.filter(item => {
        const localMatch = localItems.find(loc => loc.id === item.id || (item.applicationNo && loc.applicationNo === item.applicationNo));
        if (localMatch) {
          const hasOwnerIdentity = item.userEmail || item.userUid || item.userMobile || item.applicantDetails?.email || item.applicantDetails?.mobile || item.informantDetails?.email || item.informantMobile;
          if (!hasOwnerIdentity) return true;
        }

        const itemEmail = cleanEmail(item.userEmail || item.applicantDetails?.email || item.informantDetails?.email);
        const itemUid = item.userUid;
        const itemMobile = cleanMobile(item.userMobile || item.applicantDetails?.mobile || item.informantMobile);
        const itemName = cleanEmail(item.userDisplayName || item.applicantDetails?.fullName);

        let itemDerivedMobile = itemMobile;
        if (!itemDerivedMobile && itemEmail) {
          const m = itemEmail.match(/^([6-9]\d{9})/);
          if (m) itemDerivedMobile = m[1];
        }

        const emailMatch = activeEmail && itemEmail && (itemEmail === activeEmail || itemEmail.includes(activeEmail) || activeEmail.includes(itemEmail));
        const uidMatch = activeUid && itemUid && itemUid === activeUid;
        const mobileMatch = derivedMobile && itemDerivedMobile && derivedMobile === itemDerivedMobile;
        const nameMatch = activeName && itemName && activeName.length >= 3 && itemName.length >= 3 && (activeName.includes(itemName) || itemName.includes(activeName));

        return Boolean(emailMatch || uidMatch || mobileMatch || nameMatch);
      });
    }

    items.sort((a, b) => new Date(b.updatedAt || b.appliedAt || b.createdAt || 0) - new Date(a.updatedAt || a.appliedAt || a.createdAt || 0));
    saveLocalDeathCertificates(items);
    return items;
  } catch (error) {
    console.warn('[DeathCertificateService] Firestore read notice:', error.message);
    return localItems;
  }
}

export async function updateDeathCertificateStatus({
  id,
  newStatus,
  remarks,
  officerName = 'Nagar Palika Officer',
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
  const localList = getLocalDeathCertificates();
  const localObj = localList.find(r => r.id === id || (r.applicationNo && r.applicationNo === id));
  if (localObj) existing = { ...localObj };

  let targetId = existing.id || id;

  try {
    let docRef = doc(db, COLLECTION_NAME, targetId);
    let snap = await getDoc(docRef).catch(() => null);

    if (!snap || !snap.exists()) {
      const q = query(collection(db, COLLECTION_NAME), where('applicationNo', '==', id));
      const qSnap = await getDocs(q).catch(() => null);
      if (qSnap && !qSnap.empty) {
        snap = qSnap.docs[0];
        targetId = snap.id;
      }
    }

    if (snap && snap.exists()) {
      existing = { ...snap.data(), ...existing, id: snap.id };
      targetId = snap.id;
    }
  } catch (e) {}

  if (!existing.applicationNo && !existing.deceasedDetails && !existing.applicantDetails) {
    console.error('[DeathCertificateService] Missing core details, aborting update for id:', id);
    return { success: false, error: 'मूल आवेदन विवरण अप्राप्य है। कृपया पेज रिफ्रेश कर पुनः प्रयास करें।' };
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

  if (officialUploadedCertificate) {
    updatePayload.officialUploadedCertificate = officialUploadedCertificate;
  }

  if (newStatus === 'Approved' || newStatus === 'Certificate Generated' || newStatus === 'Completed') {
    updatePayload.approvedAt = existing.approvedAt || now;
    updatePayload.approvedBy = officerName;
    updatePayload.certificateNo = certificateNo || existing.certificateNo || `DC-CERT-${Date.now().toString().slice(-6)}`;
  }

  await ensureFirebaseAuth();
  const fullRecord = sanitizeFirestorePayload({ ...existing, ...updatePayload, id: targetId });

  try {
    const docRef = doc(db, COLLECTION_NAME, targetId);
    await setDoc(docRef, fullRecord, { merge: true });
    console.log('[DeathCertificateService] Status successfully updated in Firestore backend:', newStatus);
  } catch (error) {
    console.error('[DeathCertificateService] Firestore setDoc error:', error.message);
  }

  syncLocalRecord(fullRecord);

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      serviceType: 'death_certificate',
      applicationId: targetId,
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

  let notificationMsg = `आपका मृतक प्रमाण पत्र आवेदन (${existing.applicationNo || id}) की स्थिति बदलकर ${newStatus} कर दी गई है। (Your death certificate application status has been changed to ${newStatus}.)`;
  if (newStatus === 'Under Review') {
    notificationMsg = `🔍 आपका आवेदन (${existing.applicationNo || id}) अब समीक्षा में है। (Your application is now under review.)`;
  } else if (newStatus === 'Correction Requested') {
    notificationMsg = `⚠ आपके आवेदन (${existing.applicationNo || id}) में सुधार की आवश्यकता है। कारण: ${remarks.trim()} (Correction required in your application. Reason: ${remarks.trim()})`;
  } else if (newStatus === 'Rejected') {
    notificationMsg = `❌ आपका आवेदन (${existing.applicationNo || id}) निरस्त कर दिया गया है। कारण: ${remarks.trim()} (Your application has been rejected. Reason: ${remarks.trim()})`;
  } else if (newStatus === 'Approved' || newStatus === 'Certificate Generated') {
    notificationMsg = `✅ आपका मृतक प्रमाण पत्र (${existing.applicationNo || id}) स्वीकृत एवं जनरेट कर दिया गया है! (Your death certificate has been approved and generated!)`;
  } else if (newStatus === 'Certificate Issued') {
    notificationMsg = `🎉 आपका मृतक प्रमाण पत्र (${existing.applicationNo || id}) जारी कर दिया गया है! आप इसे डाउनलोड कर सकते हैं। (Your death certificate has been issued! You can now download it.)`;
  }

  await sendNotification({
    serviceType: 'death_certificate',
    applicationId: id,
    applicationNo: existing.applicationNo || '',
    userEmail: existing.userEmail || existing.applicantDetails?.email || '',
    userUid: existing.userUid || '',
    recipientId: existing.userEmail || existing.applicantDetails?.mobile || 'citizen',
    event: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
    status: newStatus,
    message: notificationMsg,
    officerRemark: remarks.trim(),
    officerName
  });

  return { success: true, certificateNo: updatePayload.certificateNo };
}

export async function purgeAnonymousDeathCertificates() {
  if (typeof window !== 'undefined') {
    const list = getLocalDeathCertificates();
    const cleanList = list.filter(item => item.userEmail || item.userUid || item.applicantDetails?.email);
    saveLocalDeathCertificates(cleanList);
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
