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

const COLLECTION_NAME = 'birthCertificates';
const AUDIT_LOGS_COLLECTION = 'auditLogs';

function generateAppNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `BC-${year}-${random}`;
}

function getLocalBirthCertificates() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('bc_birth_certificates');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalBirthCertificates(list) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('bc_birth_certificates', JSON.stringify(list));
  } catch (e) {}
}

function syncLocalRecord(record) {
  const list = getLocalBirthCertificates();
  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalBirthCertificates(list);
}

export async function saveBirthCertificateDraft(data, existingId = null) {
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
            remarks: 'जन्म प्रमाण पत्र प्रारूप सहेजा गया (Draft saved by citizen)',
            timestamp: new Date().toISOString()
          }
        ]
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
      syncLocalRecord({ id: docRef.id, ...newDoc });

      await sendNotification({
        serviceType: 'birth_certificate',
        applicationId: docRef.id,
        applicationNo,
        recipientId: 'all',
        event: 'DRAFT_SAVED',
        status: 'Draft',
        message: `📝 जन्म प्रमाण पत्र प्रारूप (${applicationNo}) सहेजा गया। (Birth certificate draft saved.)`,
        officerRemark: '',
        officerName: 'Citizen System'
      });

      return { success: true, id: docRef.id, applicationNo };
    }
  } catch (error) {
    console.warn('[BirthCertificateService] Firestore fallback to local storage:', error.message);
    const localId = existingId || `local-bc-${Date.now()}`;
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
          remarks: 'जन्म प्रमाण पत्र प्रारूप सहेजा गया (Draft saved locally)',
          timestamp: new Date().toISOString()
        }
      ]
    };
    syncLocalRecord(localDoc);

    await sendNotification({
      serviceType: 'birth_certificate',
      applicationId: localId,
      applicationNo,
      recipientId: 'all',
      event: 'DRAFT_SAVED',
      status: 'Draft',
      message: `📝 जन्म प्रमाण पत्र प्रारूप (${applicationNo}) सहेजा गया। (Birth certificate draft saved.)`,
      officerRemark: '',
      officerName: 'Citizen System'
    });

    return { success: true, id: localId, applicationNo };
  }
}

import { formatOfficialDocumentVault } from '../utils/documentVault';

export async function submitBirthCertificate(data, existingId = null) {
  const isResubmission = Boolean(existingId && data.status === 'Correction Requested');
  const applicationNo = data.applicationNo || generateAppNumber();
  const now = new Date().toISOString();

  const formattedDocuments = formatOfficialDocumentVault(data.documents, applicationNo, 'birth_certificate');
  const processedData = {
    ...data,
    documents: formattedDocuments,
    documentVaultPath: `applications/birth_certificate/${new Date().getFullYear()}/${applicationNo}/documents/`
  };

  const timelineItem = {
    id: `t-${Date.now()}`,
    action: isResubmission ? 'Application Resubmitted' : 'Application Submitted',
    status: 'Submitted',
    performedBy: data.applicantDetails?.fullName || 'Citizen',
    role: 'Citizen',
    remarks: isResubmission 
      ? 'सुधार पश्चात जन्म प्रमाण पत्र आवेदन पुनः प्रस्तुत किया गया (Resubmitted after correction)' 
      : 'जन्म प्रमाण पत्र आवेदन जमा किया गया (Birth certificate application submitted)',
    timestamp: now
  };

  let docId = existingId || `local-bc-${Date.now()}`;

  try {
    if (existingId) {
      const docRef = doc(db, COLLECTION_NAME, existingId);
      const existingSnap = await getDoc(docRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};
      const updatedTimeline = [...(existingData.timeline || []), timelineItem];

      const updateData = {
        ...processedData,
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
        ...processedData,
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
    console.warn('[BirthCertificateService] Firestore submit fallback to local storage:', error.message);
    const existingList = getLocalBirthCertificates();
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
    serviceType: 'birth_certificate',
    applicationId: docId,
    applicationNo,
    recipientId: 'all',
    event: isResubmission ? 'APPLICATION_RESUBMITTED' : 'APPLICATION_SUBMITTED',
    status: 'Submitted',
    message: `जन्म प्रमाण पत्र आवेदन (${applicationNo}) सफलतापूर्वक जमा किया गया। (Birth certificate application submitted successfully.)`,
    officerRemark: '',
    officerName: 'Citizen System'
  });

  return { success: true, id: docId, applicationNo };
}

export async function getBirthCertificates() {
  const localItems = getLocalBirthCertificates();
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const remoteItems = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    const mergedMap = new Map();
    remoteItems.forEach(item => mergedMap.set(item.id, item));
    localItems.forEach(item => {
      const existingRemote = mergedMap.get(item.id);
      if (existingRemote) {
        mergedMap.set(item.id, { ...item, ...existingRemote });
      } else {
        mergedMap.set(item.id, item);
        if (item.id && item.status && item.status !== 'Draft') {
          try {
            const docRef = doc(db, COLLECTION_NAME, item.id);
            setDoc(docRef, item, { merge: true }).catch(() => {});
          } catch (e) {}
        }
      }
    });

    const items = Array.from(mergedMap.values());
    items.sort((a, b) => new Date(b.appliedAt || b.updatedAt || 0) - new Date(a.appliedAt || a.updatedAt || 0));
    saveLocalBirthCertificates(items);
    return items;
  } catch (error) {
    console.warn('[BirthCertificateService] Firestore read fallback to local storage:', error.message);
    return localItems;
  }
}

export async function updateBirthCertificateStatus({
  id,
  newStatus,
  remarks,
  officerName = 'Nagar Palika Officer',
  certificateNo = null
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
  const localList = getLocalBirthCertificates();
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

  if (newStatus === 'Approved' || newStatus === 'Certificate Generated' || newStatus === 'Completed') {
    updatePayload.approvedAt = existing.approvedAt || now;
    updatePayload.approvedBy = officerName;
    updatePayload.certificateNo = certificateNo || existing.certificateNo || `BC-CERT-${Date.now().toString().slice(-6)}`;
  }

  const fullRecord = { ...existing, ...updatePayload, id };

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, fullRecord, { merge: true });
  } catch (error) {
    console.warn('[BirthCertificateService] Status updated in local storage');
  }

  syncLocalRecord(fullRecord);

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      serviceType: 'birth_certificate',
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

  let notificationMsg = `आपका जन्म प्रमाण पत्र आवेदन (${existing.applicationNo || id}) की स्थिति बदलकर ${newStatus} कर दी गई है।`;
  if (newStatus === 'Under Review') {
    notificationMsg = `🔍 आपका जन्म प्रमाण पत्र आवेदन (${existing.applicationNo || id}) अब समीक्षा में है।`;
  } else if (newStatus === 'Correction Requested') {
    notificationMsg = `⚠ आपके जन्म प्रमाण पत्र आवेदन (${existing.applicationNo || id}) में सुधार की आवश्यकता है। कारण: ${remarks.trim()}`;
  } else if (newStatus === 'Rejected') {
    notificationMsg = `❌ आपका जन्म प्रमाण पत्र आवेदन (${existing.applicationNo || id}) निरस्त कर दिया गया है। कारण: ${remarks.trim()}`;
  } else if (newStatus === 'Approved' || newStatus === 'Certificate Generated') {
    notificationMsg = `✅ आपका जन्म प्रमाण पत्र (${existing.applicationNo || id}) स्वीकृत एवं जनरेट कर दिया गया है!`;
  } else if (newStatus === 'Certificate Issued') {
    notificationMsg = `🎉 आपका जन्म प्रमाण पत्र (${existing.applicationNo || id}) जारी कर दिया गया है! आप इसे डाउनलोड कर सकते हैं।`;
  }

  await sendNotification({
    serviceType: 'birth_certificate',
    applicationId: id,
    applicationNo: existing.applicationNo || '',
    recipientId: existing.applicantDetails?.mobile || 'citizen',
    event: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
    status: newStatus,
    message: notificationMsg,
    officerRemark: remarks.trim(),
    officerName
  });

  return { success: true, certificateNo: updatePayload.certificateNo };
}
