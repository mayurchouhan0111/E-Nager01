// Automated Test: Multi-User Isolation & Session Purge Verification
import { clearCitizenLocalCaches } from './src/services/citizenAuthService.js';

console.log('🧪 Starting Multi-User Session Isolation & Cache Purge Test...\n');

// Mock localStorage in Node environment
const mockStorage = new Map();
global.window = {
  dispatchEvent: () => {}
};
global.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  get length() { return mockStorage.size; },
  key: (i) => Array.from(mockStorage.keys())[i]
};

// 1. Simulate Citizen Alpha session
const userAlpha = {
  uid: 'user-alpha-123',
  email: 'alpha.sharma@gmail.com',
  displayName: 'Alpha Sharma',
  mobile: '9826011111'
};

const userAlphaKey = 'alpha_sharma_gmail_com';
const alphaBirthRecord = {
  id: 'bc-alpha-001',
  applicationNo: 'BC-2026-11111',
  userEmail: userAlpha.email,
  userUid: userAlpha.uid,
  status: 'Submitted',
  childDetails: { fullName: 'Baby Alpha' }
};

localStorage.setItem('enagar_citizen_user', JSON.stringify(userAlpha));
localStorage.setItem(`bc_birth_certificates_${userAlphaKey}`, JSON.stringify([alphaBirthRecord]));
localStorage.setItem('bc_birth_certificates', JSON.stringify([alphaBirthRecord])); // legacy key

console.log('✅ Citizen Alpha session initialized with 1 birth record in isolated partition.');
console.log('  Alpha Partition Key:', `bc_birth_certificates_${userAlphaKey}`);
console.log('  Total LocalStorage Keys:', mockStorage.size);

// 2. Perform Logout & Purge
clearCitizenLocalCaches();

console.log('\n🔒 Logout executed & clearCitizenLocalCaches() triggered.');
console.log('  enagar_citizen_user exists?:', Boolean(localStorage.getItem('enagar_citizen_user')));
console.log('  Legacy bc_birth_certificates exists?:', Boolean(localStorage.getItem('bc_birth_certificates')));
console.log('  Alpha Partition exists?:', Boolean(localStorage.getItem(`bc_birth_certificates_${userAlphaKey}`)));
console.log('  Remaining LocalStorage Keys:', mockStorage.size);

if (mockStorage.size !== 0) {
  console.error('❌ Cache Purge Failed! Remaining keys:', Array.from(mockStorage.keys()));
  process.exit(1);
}
console.log('✅ PASSED: All citizen partitions and legacy cache keys 100% purged upon logout.');

// 3. Simulate Citizen Beta session
const userBeta = {
  uid: 'user-beta-456',
  email: 'beta.verma@gmail.com',
  displayName: 'Beta Verma',
  mobile: '9826022222'
};
const userBetaKey = 'beta_verma_gmail_com';

localStorage.setItem('enagar_citizen_user', JSON.stringify(userBeta));
const betaPartition = localStorage.getItem(`bc_birth_certificates_${userBetaKey}`);
const legacyPartition = localStorage.getItem('bc_birth_certificates');

console.log('\n👤 Citizen Beta logged in on same browser/device:');
console.log('  Beta Partition Content:', betaPartition ? JSON.parse(betaPartition) : 'EMPTY (Clean)');
console.log('  Legacy Partition Content:', legacyPartition ? JSON.parse(legacyPartition) : 'EMPTY (Clean)');

if (betaPartition !== null || legacyPartition !== null) {
  console.error('❌ Data leakage detected! Beta found leftover data.');
  process.exit(1);
}

console.log('\n🎉 ALL MULTI-USER CACHE ISOLATION & PURGE TESTS PASSED (100%)!');
