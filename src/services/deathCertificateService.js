import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { sendNotification } from './notificationService';

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
  } catch (e) {}
}

function syncLocalRecord(record) {
  const list = getLocalDeathCertificates();
  const idx = list.findIndex(r => r.id === record.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...record };
  } else {
    list.unshift(record);
  }
  saveLocalDeathCertificates(list);
}

export async function saveDeathCertificateDraft(data, existingId = null) {
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
            remarks: 'प्रारूप सहेजा गया (Draft saved by citizen)',
            timestamp: new Date().toISOString()
          }
        ]
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newDoc);
      syncLocalRecord({ id: docRef.id, ...newDoc });

      await sendNotification({
        serviceType: 'death_certificate',
        applicationId: docRef.id,
        applicationNo,
        recipientId: 'all',
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

export async function submitDeathCertificate(data, existingId = null) {
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
      ? 'सुधार पश्चात आवेदन पुन: प्रस्तुत किया गया (Resubmitted after correction)' 
      : 'आवेदन प्रस्तुत किया गया (Application submitted)',
    timestamp: now
  };

  let docId = existingId || `local-dc-${Date.now()}`;

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
    console.warn('[DeathCertificateService] Firestore submit fallback to local storage:', error.message);
    const existingList = getLocalDeathCertificates();
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
    serviceType: 'death_certificate',
    applicationId: docId,
    applicationNo,
    recipientId: 'all',
    event: isResubmission ? 'APPLICATION_RESUBMITTED' : 'APPLICATION_SUBMITTED',
    status: 'Submitted',
    message: `मृतक प्रमाण पत्र आवेदन (${applicationNo}) सफलतापूर्वक जमा किया गया। (Death certificate application submitted successfully.)`,
    officerRemark: '',
    officerName: 'Citizen System'
  });

  return { success: true, id: docId, applicationNo };
}

export async function getDeathCertificates() {
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    const items = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    items.sort((a, b) => new Date(b.appliedAt || b.updatedAt || 0) - new Date(a.appliedAt || a.updatedAt || 0));
    saveLocalDeathCertificates(items);
    return items;
  } catch (error) {
    console.warn('[DeathCertificateService] Firestore read fallback to local storage:', error.message);
    return getLocalDeathCertificates();
  }
}

export async function updateDeathCertificateStatus({
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
  const localList = getLocalDeathCertificates();
  const localObj = localList.find(r => r.id === id);
  if (localObj) existing = localObj;

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
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
    updatePayload.certificateNo = certificateNo || existing.certificateNo || `DC-CERT-${Date.now().toString().slice(-6)}`;
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.warn('[DeathCertificateService] Status update fallback to local storage:', error.message);
  }

  syncLocalRecord({ id, ...existing, ...updatePayload });

  try {
    await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
      serviceType: 'death_certificate',
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
    recipientId: existing.applicantDetails?.mobile || 'citizen',
    event: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, '_')}`,
    status: newStatus,
    message: notificationMsg,
    officerRemark: remarks.trim(),
    officerName
  });

  return { success: true, certificateNo: updatePayload.certificateNo };
}
