/**
 * Professional e-Governance Document Vault Formatter
 * Organizes uploaded files into standardized government directory structure & metadata:
 * Directory: applications/[serviceType]/[year]/[applicationNo]/documents/
 * Standardized File Name: [applicationNo]_[DocumentKey].[ext]
 */
export function formatOfficialDocumentVault(documents, applicationNo, serviceType = 'general') {
  if (!documents || typeof documents !== 'object') return {};

  const year = new Date().getFullYear();
  const folderPath = `applications/${serviceType}/${year}/${applicationNo}/documents/`;

  const formattedVault = {};

  Object.entries(documents).forEach(([docKey, docObj]) => {
    if (docObj && typeof docObj === 'object' && (docObj.fileData || docObj.fileUrl || docObj.url)) {
      const originalName = docObj.fileName || `${docKey}.jpg`;
      const ext = originalName.includes('.')
        ? originalName.split('.').pop()
        : (docObj.fileType?.includes('pdf') ? 'pdf' : 'jpg');

      const officialFileName = `${applicationNo}_${docKey}.${ext}`;
      const fullVirtualPath = `${folderPath}${officialFileName}`;

      formattedVault[docKey] = {
        ...docObj,
        docKey,
        folderPath,
        fullVirtualPath,
        officialFileName,
        storageBucket: 'e-nagar-jhabua-vault',
        vaultCategory: serviceType,
        archivedAt: docObj.uploadedAt || new Date().toISOString()
      };
    }
  });

  return formattedVault;
}
