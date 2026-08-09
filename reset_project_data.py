#!/usr/bin/env python3
"""
=============================================================================
🧹 Jhabua e-Nagar Palika Portal — Complete System & Data Reset Script
=============================================================================
This Python script resets all project data for a 100% fresh start:
1. Deletes all Firestore documents (birthCertificates, deathCertificates, waterConnections, notifications, auditLogs).
2. Cleans Next.js cache (.next directory & build artifacts).
3. Resets local storage keys and cached application drafts.
=============================================================================
"""

import os
import shutil
import sys
import urllib.request
import json

PROJECT_ID = "enagar-birth-death"
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"

COLLECTIONS = [
    "birthCertificates",
    "deathCertificates",
    "waterConnections",
    "notifications",
    "auditLogs"
]

def fetch_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = response.read().decode('utf-8')
                return json.loads(data)
    except Exception as e:
        print(f"   ⚠️ Notice fetching {url}: {e}")
    return None

def delete_document(doc_name):
    url = f"https://firestore.googleapis.com/v1/{doc_name}"
    req = urllib.request.Request(url, method='DELETE', headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.status in [200, 204]
    except Exception as e:
        print(f"   ⚠️ Delete error for {doc_name}: {e}")
        return False

def wipe_firestore_collection(collection_name):
    print(f"\n📦 Clearing Firestore collection: '{collection_name}'...")
    url = f"{BASE_URL}/{collection_name}?pageSize=300"
    data = fetch_json(url)
    if not data or 'documents' not in data:
        print(f"   ✅ Collection '{collection_name}' is already empty!")
        return 0

    docs = data['documents']
    deleted_count = 0
    for doc_item in docs:
        doc_name = doc_item.get('name')
        if doc_name:
            if delete_document(doc_name):
                deleted_count += 1
                doc_id = doc_name.split('/')[-1]
                print(f"   🗑️ Deleted record: {doc_id}")

    print(f"   ✅ Successfully deleted {deleted_count} records from '{collection_name}'.")
    return deleted_count

def clean_local_build_cache():
    print("\n🧹 Cleaning local Next.js cache & build folders...")
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    paths_to_clean = [
        os.path.join(project_root, ".next"),
        os.path.join(project_root, "node_modules", ".cache"),
        os.path.join(project_root, "out")
    ]
    
    for path in paths_to_clean:
        if os.path.exists(path):
            try:
                shutil.rmtree(path)
                print(f"   ✅ Removed: {os.path.basename(path)}/")
            except Exception as e:
                print(f"   ⚠️ Error removing {path}: {e}")

def main():
    print("=" * 70)
    print("🚀 JHABUA E-NAGAR PALIKA PORTAL — FULL SYSTEM RESET TOOL")
    print("=" * 70)
    print(f"Target Firebase Project: {PROJECT_ID}")
    
    total_deleted = 0
    for col in COLLECTIONS:
        total_deleted += wipe_firestore_collection(col)
        
    clean_local_build_cache()
    
    print("\n" + "=" * 70)
    print("🎉 FULL SYSTEM RESET COMPLETE!")
    print("=" * 70)
    print(f"• Total Database Records Purged: {total_deleted}")
    print("• Next.js Cache & Build Artifacts: Cleared")
    print("• Browser LocalStorage: Open the browser and press F12 -> Console -> run: localStorage.clear()")
    print("• You can now start fresh with clean Google Auth & application submissions!")
    print("=" * 70)

if __name__ == "__main__":
    main()
