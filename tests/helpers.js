import { test as base, expect } from '@playwright/test';

/**
 * Test data helpers for E2E flows.
 * All data uses clearly-marked "TEST" identifiers so records can be
 * identified and cleaned from Firestore after testing.
 */

export const TEST_APP_PREFIX = 'E2E_TEST';

export function uniqueSuffix() {
  return Date.now().toString().slice(-8);
}

export const birthTestData = (suffix = uniqueSuffix()) => ({
  childName: `बालक TEST ${suffix}`,
  dateOfBirth: '2024-01-15',
  birthWeight: '3.2',
  gender: 'पुरुष (Male)',
  motherName: `माता TEST ${suffix}`,
  fatherName: `पिता TEST ${suffix}`,
  applicantName: `आवेदक TEST ${suffix}`,
  mobile: '9876543210',
  aadhaar: '123456789012',
});

export const deathTestData = (suffix = uniqueSuffix()) => ({
  deceasedName: `मृतक TEST ${suffix}`,
  dateOfDeath: '2025-06-10',
  age: '65',
  applicantName: `सूचनादाता TEST ${suffix}`,
  mobile: '9876543210',
});

export const adminCredentials = {
  admin: { username: 'admin', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_BIRTH_DEATH || 'test_admin_pass' },
  super_admin: { username: 'super_admin', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_SUPER || 'test_super_pass' },
  water_admin: { username: 'water_admin', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_WATER || 'test_water_pass' },
  nodues_admin: { username: 'nodues_admin', password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD_NODUES || 'test_nodues_pass' },
};
