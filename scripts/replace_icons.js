// scripts/replace_icons.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping from lucide name to heroicons name (outline set)
const iconMap = {
  AlertCircle: 'ExclamationCircleIcon',
  Calendar: 'CalendarIcon',
  UserCheck: 'UserCheckIcon',
  History: 'ClockIcon',
  Info: 'InformationCircleIcon',
  Lock: 'LockClosedIcon',
  LogOut: 'ArrowLeftOnRectangleIcon',
  RefreshCw: 'ArrowPathIcon',
  X: 'XMarkIcon',
  Settings2: 'Cog8ToothIcon',
  Baby: 'BabyIcon',
  Eye: 'EyeIcon',
  Droplet: 'DropIcon',
  Key: 'KeyIcon',
  Save: 'ArrowDownTrayIcon',
  Building2: 'BuildingOffice2Icon',
  Bell: 'BellIcon',
  Mail: 'EnvelopeIcon',
  Clock: 'ClockIcon',
  ChevronDown: 'ChevronDownIcon',
  ChevronRight: 'ChevronRightIcon',
  User: 'UserIcon',
  Phone: 'PhoneIcon',
  Paperclip: 'PaperClipIcon',
  Upload: 'ArrowUpTrayIcon',
  Loader2: 'ArrowPathIcon',
  CheckCircle2: 'CheckCircleIcon',
  AlertTriangle: 'ExclamationTriangleIcon',
  XCircle: 'XCircleIcon',
  FileEdit: 'PencilIcon',
  FileText: 'DocumentTextIcon',
  Trash2: 'TrashIcon',
  Search: 'MagnifyingGlassIcon',
  Download: 'ArrowDownTrayIcon',
  Edit: 'PencilIcon',
  Printer: 'PrinterIcon',
  Activity: 'ChartBarIcon',
  ShieldAlert: 'ShieldCheckIcon',
  // Add more as needed
};

// Files to exclude (frozen components)
const excluded = ['src/components/ServiceHeader.js'];

const files = glob.sync('src/**/*.js', { nodir: true }).concat(glob.sync('src/**/*.tsx', { nodir: true }));
files.forEach((file) => {
  if (excluded.some((ex) => file.endsWith(ex))) return;
  const original = fs.readFileSync(file, 'utf8');
  let content = original;
  // Replace import source and names
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g;
  content = content.replace(importRegex, (match, imports) => {
    const names = imports.split(',').map(i => i.trim());
    const newNames = names.map(name => iconMap[name] || name).join(', ');
    return `import { ${newNames} } from '@heroicons/react/24/outline'`;
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Icon replacement complete');

