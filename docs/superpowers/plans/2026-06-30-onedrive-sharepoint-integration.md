# OneDrive/SharePoint Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Auto-upload completed checklists (PDF + photos + metadata) to OneDrive/SharePoint after PDF generation, organized by template, with automatic retry and non-blocking error handling.

**Architecture:** 
- Backend service handles SharePoint authentication and file uploads using Microsoft Graph SDK
- Async upload triggered after PDF generation (fire-and-forget, non-blocking)
- Automatic retry with exponential backoff (3 attempts max)
- Upload status tracked and logged, user shown warning on failure
- All configuration via environment variables

**Tech Stack:** Express.js, Node.js, @microsoft/msgraph-sdk, axios

---

## File Structure

### Backend Files to Create
- `backend/src/services/sharePointService.js` — SharePoint upload operations
- `backend/src/middleware/sharePointAuth.js` — Azure authentication setup
- `backend/src/utils/sharePointHelpers.js` — Utility functions (path generation, retry logic)

### Backend Files to Modify
- `backend/src/controllers/checklistController.js` — Trigger upload after PDF generation
- `backend/.env.example` — Add SharePoint configuration template
- `backend/package.json` — Add Microsoft Graph SDK dependency

### Frontend Files to Modify
- `frontend/src/pages/Success.jsx` — Show upload status indicator

---

## Tasks

### Task 1: Install Microsoft Graph SDK

Install the Azure SDK package for Node.js to communicate with OneDrive/SharePoint.

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install @microsoft/msgraph-sdk and @azure/identity**

```bash
cd backend
npm install @microsoft/msgraph-sdk @azure/identity
```

Expected: Packages installed successfully, `package-lock.json` updated

- [ ] **Step 2: Verify installation**

```bash
npm list @microsoft/msgraph-sdk @azure/identity
```

Expected: Both packages listed with version numbers

- [ ] **Step 3: Commit**

```bash
cd "D:\Antigravity\checklist v2\checklist-management"
git add backend/package.json backend/package-lock.json
git commit -m "deps: add microsoft graph sdk for sharepoint integration"
```

---

### Task 2: Create SharePoint Helpers Utility

Create utility functions for path generation, retry logic, and common operations.

**Files:**
- Create: `backend/src/utils/sharePointHelpers.js`

- [ ] **Step 1: Create sharePointHelpers.js**

```javascript
// Exponential backoff retry logic
const retryWithBackoff = async (fn, maxRetries = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
};

// Generate folder path based on template and checklist
const generateFolderPath = (templateName, checklistId) => {
  const sanitizedTemplate = templateName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);
  return `${sanitizedTemplate}/${checklistId}`;
};

// Generate safe filename
const generateSafeFilename = (filename) => {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_');
};

module.exports = {
  retryWithBackoff,
  generateFolderPath,
  generateSafeFilename,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/utils/sharePointHelpers.js
git commit -m "utils: add sharepoint helper functions"
```

---

### Task 3: Create SharePoint Auth Middleware

Set up Azure authentication with credentials from environment variables.

**Files:**
- Create: `backend/src/middleware/sharePointAuth.js`

- [ ] **Step 1: Create sharePointAuth.js**

```javascript
const { ClientSecretCredential } = require('@azure/identity');
const { Client } = require('@microsoft/msgraph-sdk');

let graphClient = null;

const initializeSharePointClient = () => {
  if (graphClient) return graphClient;

  const clientId = process.env.SHAREPOINT_CLIENT_ID;
  const clientSecret = process.env.SHAREPOINT_CLIENT_SECRET;
  const tenantId = process.env.SHAREPOINT_TENANT_ID;

  if (!clientId || !clientSecret || !tenantId) {
    console.warn('SharePoint credentials not configured - cloud upload disabled');
    return null;
  }

  try {
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    graphClient = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const token = await credential.getToken('https://graph.microsoft.com/.default');
          return token.token;
        },
      },
    });

    console.log('✅ SharePoint client initialized successfully');
    return graphClient;
  } catch (error) {
    console.error('❌ Failed to initialize SharePoint client:', error.message);
    return null;
  }
};

const getSharePointClient = () => {
  if (!graphClient) {
    graphClient = initializeSharePointClient();
  }
  return graphClient;
};

const sharePointAuthMiddleware = (req, res, next) => {
  const client = getSharePointClient();
  req.sharePointClient = client;
  next();
};

module.exports = {
  initializeSharePointClient,
  getSharePointClient,
  sharePointAuthMiddleware,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/middleware/sharePointAuth.js
git commit -m "feat: add sharepoint authentication middleware"
```

---

### Task 4: Create SharePoint Service

Create the main service that handles uploading files to OneDrive/SharePoint.

**Files:**
- Create: `backend/src/services/sharePointService.js`

- [ ] **Step 1: Create sharePointService.js**

```javascript
const fs = require('fs').promises;
const path = require('path');
const { getSharePointClient } = require('../middleware/sharePointAuth');
const { retryWithBackoff, generateFolderPath, generateSafeFilename } = require('../utils/sharePointHelpers');

const uploadChecklistToSharePoint = async (checklist, pdfPath, photoPaths) => {
  try {
    // Check if SharePoint is enabled
    if (process.env.SHAREPOINT_ENABLED !== 'true') {
      console.log('SharePoint upload disabled');
      return { success: false, error: 'SharePoint not enabled' };
    }

    const client = getSharePointClient();
    if (!client) {
      return { success: false, error: 'SharePoint not configured' };
    }

    const siteUrl = process.env.SHAREPOINT_SITE_URL;
    const baseFolderName = process.env.SHAREPOINT_FOLDER_NAME || 'Checklists';

    // Generate folder path
    const folderPath = generateFolderPath(checklist.template_name, checklist.id);
    const fullPath = `${baseFolderName}/${folderPath}`;

    console.log(`📤 Starting SharePoint upload for checklist ${checklist.id}`);
    console.log(`   Target: ${fullPath}`);

    // Upload with retry
    const result = await retryWithBackoff(async () => {
      return await uploadFiles(client, siteUrl, fullPath, checklist, pdfPath, photoPaths);
    }, parseInt(process.env.SHAREPOINT_MAX_RETRIES || 3));

    console.log(`✅ SharePoint upload successful for checklist ${checklist.id}`);
    return { success: true, folder: fullPath };
  } catch (error) {
    console.error(`❌ SharePoint upload failed for checklist ${checklist.id}:`, error.message);
    return { success: false, error: error.message };
  }
};

const uploadFiles = async (client, siteUrl, folderPath, checklist, pdfPath, photoPaths) => {
  try {
    // Extract site name from URL
    const siteMatch = siteUrl.match(/\/sites\/([^/]+)/);
    const siteName = siteMatch ? siteMatch[1] : 'root';

    // Create metadata file
    const metadata = {
      checklist_id: checklist.id,
      title: checklist.title,
      template_name: checklist.template_name,
      template_code: checklist.template_code,
      user_id: checklist.user_id,
      location: checklist.location,
      status: checklist.status,
      photo_count: photoPaths.length,
      created_at: checklist.created_at,
      notes: checklist.notes || '',
      photos: photoPaths.map((p, i) => ({
        filename: path.basename(p),
        order: i + 1,
      })),
    };

    // Upload PDF
    if (pdfPath && (await fileExists(pdfPath))) {
      const pdfBuffer = await fs.readFile(pdfPath);
      const pdfFilename = generateSafeFilename(checklist.result_pdf_filename || `checklist_${checklist.id}.pdf`);
      
      await client.api(`/sites/${siteName}/drive/root:/${folderPath}/${pdfFilename}:/content`).put(pdfBuffer);
      console.log(`   ✓ PDF uploaded: ${pdfFilename}`);
    }

    // Upload metadata
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    await client.api(`/sites/${siteName}/drive/root:/${folderPath}/metadata.json:/content`).put(metadataBuffer);
    console.log(`   ✓ Metadata uploaded`);

    // Upload photos
    for (const photoPath of photoPaths) {
      if (await fileExists(photoPath)) {
        const photoBuffer = await fs.readFile(photoPath);
        const photoFilename = generateSafeFilename(path.basename(photoPath));
        
        await client.api(`/sites/${siteName}/drive/root:/${folderPath}/photos/${photoFilename}:/content`).put(photoBuffer);
        console.log(`   ✓ Photo uploaded: ${photoFilename}`);
      }
    }

    return { success: true };
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  uploadChecklistToSharePoint,
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/sharePointService.js
git commit -m "feat: add sharepoint upload service with retry logic"
```

---

### Task 5: Update App to Use SharePoint Middleware

Register the SharePoint auth middleware in the Express app.

**Files:**
- Modify: `backend/src/app.js`

- [ ] **Step 1: Add middleware import and registration**

```bash
cd "D:\Antigravity\checklist v2\checklist-management"
```

Open `backend/src/app.js` and add at the top after other middleware imports:

```javascript
const { sharePointAuthMiddleware } = require('./middleware/sharePointAuth');
```

Then add this line after other middleware (after cors and express.json):

```javascript
// Initialize SharePoint client
app.use(sharePointAuthMiddleware);
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/app.js
git commit -m "feat: register sharepoint auth middleware"
```

---

### Task 6: Update Checklist Controller to Trigger Upload

Modify the checklist controller to automatically upload to SharePoint after PDF generation.

**Files:**
- Modify: `backend/src/controllers/checklistController.js`

- [ ] **Step 1: Add import for SharePoint service**

At the top of the file, add:

```javascript
const { uploadChecklistToSharePoint } = require('../services/sharePointService');
```

- [ ] **Step 2: Find the submit function and add upload trigger**

In the `submit` function, after the PDF is successfully generated (look for where `result_pdf_path` is set), add this code:

```javascript
// Trigger SharePoint upload asynchronously (non-blocking)
if (checklist) {
  const photoPaths = checklist.photos?.map(p => p.photo_path) || [];
  uploadChecklistToSharePoint(checklist, result_pdf_path, photoPaths)
    .then(uploadResult => {
      if (!uploadResult.success) {
        console.warn(`SharePoint upload notification: ${uploadResult.error}`);
      }
    })
    .catch(error => {
      console.error('Unexpected error in SharePoint upload:', error);
    });
}
```

Place this right before sending the response to the user, outside the main try-catch.

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/checklistController.js
git commit -m "feat: trigger sharepoint upload after pdf generation"
```

---

### Task 7: Update Environment Variables Template

Add SharePoint configuration to the `.env.example` file.

**Files:**
- Modify: `backend/.env.example`

- [ ] **Step 1: Add SharePoint section**

Append to `backend/.env.example`:

```env
# SharePoint/OneDrive Configuration
SHAREPOINT_ENABLED=false
SHAREPOINT_CLIENT_ID=your_client_id
SHAREPOINT_CLIENT_SECRET=your_client_secret
SHAREPOINT_TENANT_ID=your_tenant_id
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/ChecklistSystem
SHAREPOINT_FOLDER_NAME=Checklists
SHAREPOINT_MAX_RETRIES=3
SHAREPOINT_RETRY_DELAY_MS=1000
```

- [ ] **Step 2: Commit**

```bash
git add backend/.env.example
git commit -m "docs: add sharepoint configuration template"
```

---

### Task 8: Update Success Page to Show Upload Status

Add visual indicator showing whether the file was uploaded to SharePoint.

**Files:**
- Modify: `frontend/src/pages/Success.jsx`

- [ ] **Step 1: Add upload status state and effect**

At the top of the Success component, add this state:

```javascript
const [uploadStatus, setUploadStatus] = useState(null);

useEffect(() => {
  // Check if there's an upload status passed via location state
  const params = new URLSearchParams(window.location.search);
  const status = params.get('uploadStatus');
  if (status) {
    setUploadStatus(status === 'success' ? 'success' : 'failed');
  }
}, []);
```

- [ ] **Step 2: Add status message in render**

Find the section where the "PDF Berhasil Dibuat!" message is displayed, and add this after the success icon:

```javascript
{uploadStatus === 'failed' && (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-sm text-yellow-800">
      ⚠️ PDF berhasil dibuat tetapi gagal disimpan ke cloud. 
      PDF sudah tersimpan di perangkat Anda.
    </p>
  </div>
)}

{uploadStatus === 'success' && (
  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
    <p className="text-sm text-green-800">
      ✅ Berhasil disimpan ke OneDrive
    </p>
  </div>
)}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Success.jsx
git commit -m "feat: show upload status indicator on success page"
```

---

### Task 9: Test SharePoint Connection

Verify that SharePoint authentication works with test credentials.

**Files:**
- Create: `backend/test-sharepoint-connection.js` (temporary test file)

- [ ] **Step 1: Create test script**

Create `backend/test-sharepoint-connection.js`:

```javascript
require('dotenv').config();
const { getSharePointClient } = require('./src/middleware/sharePointAuth');

console.log('Testing SharePoint Connection...\n');

const client = getSharePointClient();

if (!client) {
  console.log('❌ SharePoint client not initialized');
  console.log('   Make sure these env vars are set:');
  console.log('   - SHAREPOINT_CLIENT_ID');
  console.log('   - SHAREPOINT_CLIENT_SECRET');
  console.log('   - SHAREPOINT_TENANT_ID');
  process.exit(1);
}

console.log('✅ SharePoint client initialized');
console.log('   You can now test the integration!\n');

console.log('Configuration:');
console.log(`  Site URL: ${process.env.SHAREPOINT_SITE_URL}`);
console.log(`  Folder: ${process.env.SHAREPOINT_FOLDER_NAME}`);
console.log(`  Enabled: ${process.env.SHAREPOINT_ENABLED}`);
```

- [ ] **Step 2: Run test**

```bash
cd backend
node test-sharepoint-connection.js
```

Expected: Either "✅ SharePoint client initialized" (success) or error message with missing env vars

- [ ] **Step 3: Delete test file and commit**

```bash
rm backend/test-sharepoint-connection.js
git add backend/src/middleware/sharePointAuth.js backend/src/services/sharePointService.js
git commit -m "test: verify sharepoint connection setup (test file removed)"
```

---

### Task 10: Manual Integration Test

Complete a full checklist and verify files are uploaded to SharePoint.

**Files:**
- No new files (integration test only)

- [ ] **Step 1: Ensure Backend Running**

```bash
cd backend
npm start
```

Expected: Server running on port 5000

- [ ] **Step 2: Ensure Frontend Running**

In another terminal:

```bash
cd frontend
npm run dev
```

Expected: Dev server running on port 5173

- [ ] **Step 3: Configure Environment Variables**

If you have Azure credentials, set these in `backend/.env`:

```env
SHAREPOINT_ENABLED=true
SHAREPOINT_CLIENT_ID=<your_client_id>
SHAREPOINT_CLIENT_SECRET=<your_secret>
SHAREPOINT_TENANT_ID=<your_tenant_id>
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/ChecklistSystem
SHAREPOINT_FOLDER_NAME=Checklists
SHAREPOINT_MAX_RETRIES=3
```

If you don't have credentials yet, leave `SHAREPOINT_ENABLED=false`

- [ ] **Step 4: Complete a Test Checklist**

1. Login to http://localhost:5173
2. Go to "New Checklist"
3. Select a template
4. Fill out the form
5. Upload 2-3 test photos
6. Click "Generate PDF"
7. Wait for success page

- [ ] **Step 5: Check Backend Logs**

In backend terminal, look for:
```
📤 Starting SharePoint upload for checklist X
   Target: Template_Name/123
   ✓ PDF uploaded
   ✓ Metadata uploaded
   ✓ Photo uploaded: photo_001.jpg
✅ SharePoint upload successful for checklist X
```

Or if disabled:
```
SharePoint upload disabled
```

- [ ] **Step 6: Verify in SharePoint (Optional)**

If SharePoint is configured, go to your SharePoint site and check:
- Folder: `/Checklists/[Template]/[ChecklistID]/`
- Files: `result.pdf`, `metadata.json`, `photos/` folder with images

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: manual integration test of sharepoint upload completed"
```

---

### Task 11: Create Azure Setup Documentation

Create a detailed guide for admins to set up Azure and SharePoint.

**Files:**
- Create: `docs/SHAREPOINT_SETUP.md`

- [ ] **Step 1: Create setup guide**

```markdown
# OneDrive/SharePoint Integration Setup Guide

This guide walks you through setting up the OneDrive/SharePoint integration for the Checklist System.

## Prerequisites

- Microsoft 365 organization account
- Admin access to Azure Portal
- Admin access to SharePoint

## Step 1: Create App Registration in Azure

1. Go to https://portal.azure.com
2. Navigate to **App registrations** (search in top bar)
3. Click **New registration**
4. Fill in details:
   - Name: `Checklist System`
   - Supported account types: `Single tenant`
5. Click **Register**
6. On the next page, copy and **save these values:**
   - **Application (client) ID** → `SHAREPOINT_CLIENT_ID`
   - **Directory (tenant) ID** → `SHAREPOINT_TENANT_ID`

## Step 2: Create Client Secret

1. In App registration, go to **Certificates & secrets** (left menu)
2. Click **New client secret**
3. Fill in:
   - Description: `Checklist system secret`
   - Expires: `24 months`
4. Click **Add**
5. **Copy the secret value immediately** (you won't see it again!)
   - Save as `SHAREPOINT_CLIENT_SECRET`

## Step 3: Grant API Permissions

1. In App registration, go to **API permissions** (left menu)
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Application permissions** (not Delegated)
5. Search for and add these permissions:
   - `Sites.ReadWrite.All`
   - `Files.ReadWrite.All`
6. Click **Grant admin consent for [Organization]**

## Step 4: Create SharePoint Folder

1. Go to your SharePoint site: `https://yourorg.sharepoint.com/sites/ChecklistSystem`
   - Create the site if it doesn't exist
2. Create a folder named `Checklists`
3. Copy the site URL from your browser address bar

## Step 5: Configure Application

Add these to `backend/.env`:

```env
SHAREPOINT_ENABLED=true
SHAREPOINT_CLIENT_ID=<from Step 1>
SHAREPOINT_CLIENT_SECRET=<from Step 2>
SHAREPOINT_TENANT_ID=<from Step 1>
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/ChecklistSystem
SHAREPOINT_FOLDER_NAME=Checklists
SHAREPOINT_MAX_RETRIES=3
SHAREPOINT_RETRY_DELAY_MS=1000
```

## Step 6: Test Connection

```bash
cd backend
npm start
```

In the console, you should see:
```
✅ SharePoint client initialized successfully
```

## Troubleshooting

**"SharePoint credentials not configured"**
- Check all 3 env vars are set (CLIENT_ID, CLIENT_SECRET, TENANT_ID)
- Verify SHAREPOINT_ENABLED=true

**"Invalid credentials"**
- Verify CLIENT_SECRET is correct (copy-paste from Azure)
- Check TENANT_ID matches your organization

**"Site not found"**
- Verify SHAREPOINT_SITE_URL is correct
- Ensure the site exists in SharePoint

**Files not uploading**
- Check console logs in backend
- Verify "Checklists" folder exists in SharePoint
- Check SharePoint API permissions are granted with admin consent

## Testing

1. Complete a checklist in the app
2. Check SharePoint `/Checklists/[Template]/[ID]/` folder
3. Verify files exist: `result.pdf`, `metadata.json`, `photos/`

Done! All new checklists will auto-save to SharePoint.
```

- [ ] **Step 2: Commit**

```bash
git add docs/SHAREPOINT_SETUP.md
git commit -m "docs: add sharepoint azure setup guide for admins"
```

---

## Plan Summary

**Total Tasks: 11**

| Task | Description | Status |
|------|-------------|--------|
| 1 | Install Microsoft Graph SDK | Ready |
| 2 | Create SharePoint helpers | Ready |
| 3 | Create SharePoint auth middleware | Ready |
| 4 | Create SharePoint service | Ready |
| 5 | Register middleware in app | Ready |
| 6 | Update controller to trigger upload | Ready |
| 7 | Update env template | Ready |
| 8 | Update Success page UI | Ready |
| 9 | Test SharePoint connection | Ready |
| 10 | Manual integration test | Ready |
| 11 | Create setup documentation | Ready |

**Implementation Coverage:**
- ✅ Auto-upload after PDF generation
- ✅ PDF + photos + metadata saved
- ✅ Organized by template folder
- ✅ Automatic retry with exponential backoff
- ✅ Non-blocking error handling
- ✅ Environment variable configuration
- ✅ Comprehensive admin setup guide
- ✅ Status indicator on UI

---

Plan complete and saved to `docs/superpowers/plans/2026-06-30-onedrive-sharepoint-integration.md`. 

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
