# OneDrive/SharePoint Integration Design

**Date:** 2026-06-30  
**Project:** Checklist Management v2  
**Feature:** Auto-save completed checklists to OneDrive/SharePoint

## Overview

After a user completes a checklist and generates a PDF, the system automatically saves the complete results (PDF + photos + metadata) to OneDrive/SharePoint, organized by template. If the save fails, the user sees a warning notification but can continue without being blocked.

## Requirements

- **What to save:** PDF file + all photos + checklist metadata (JSON)
- **When:** Automatically after PDF generation completes
- **Where:** OneDrive/SharePoint folder organized by template: `/Checklists/[Template-Name]/[Checklist-ID]/`
- **Auth:** Application credentials (Service Principal) configured by admin via environment variables
- **User experience:** Non-blocking - show warning if fails, but don't prevent user from accessing PDF
- **Error handling:** Automatic retry with exponential backoff (max 3 attempts)

## Architecture

### Backend Components

**1. SharePoint Service (`backend/src/services/sharePointService.js`)**
- Initialize Microsoft Graph client with credentials
- Upload file (PDF, photos, metadata)
- Handle retries and errors
- Create folder structure if needed
- Return upload status (success/failure)

**2. SharePoint Auth Middleware (`backend/src/middleware/sharePointAuth.js`)**
- Load credentials from environment variables
- Initialize Azure authentication
- Handle credential validation
- Provide authenticated client to services

**3. Checklist Controller Update (`backend/src/controllers/checklistController.js`)**
- After PDF generation, call `uploadChecklistToSharePoint()`
- Capture upload result (success/error)
- Store upload status in database (optional)
- Log results for debugging

**4. Uploads Service Update (`backend/src/services/uploadService.js` or similar)**
- After PDF is successfully written
- Trigger SharePoint upload asynchronously
- Don't wait for upload to complete (fire-and-forget with logging)
- Handle upload result separately

### Frontend Changes

**Success Page (`frontend/src/pages/Success.jsx`)**
- Add upload status indicator
- Show message if upload failed: "⚠️ PDF downloaded locally, but cloud save failed"
- Allow retry option if needed (optional)

**Checklist Detail Page (`frontend/src/pages/ChecklistDetail.jsx`)**
- Show upload status in header (if file exists in SharePoint)

## Data Structure

### Folder Organization in OneDrive/SharePoint

```
/Checklists/
├── Energization Checklist/
│   ├── checklist_001/
│   │   ├── metadata.json
│   │   ├── result.pdf
│   │   └── photos/
│   │       ├── photo_001.jpg
│   │       ├── photo_002.jpg
│   │       └── photo_003.jpg
│   ├── checklist_002/
│   └── ...
├── HVAC Maintenance Checklist/
│   └── ...
```

### metadata.json Structure

```json
{
  "checklist_id": 123,
  "title": "Energization Check - Building A",
  "template_name": "Energization Checklist",
  "template_code": "IF_002",
  "user_id": 5,
  "user_name": "John Doe",
  "user_email": "john@example.com",
  "location": "Building A, Floor 3",
  "status": "completed",
  "photo_count": 5,
  "created_at": "2026-06-30T10:30:00Z",
  "completed_at": "2026-06-30T11:45:00Z",
  "notes": "All systems checked and working properly",
  "photos": [
    {
      "filename": "photo_001.jpg",
      "caption": "Main panel",
      "order": 1
    }
  ]
}
```

## Configuration

### Environment Variables (`.env`)

```env
# SharePoint/OneDrive Configuration
SHAREPOINT_ENABLED=true
SHAREPOINT_CLIENT_ID=your_client_id_from_azure
SHAREPOINT_CLIENT_SECRET=your_client_secret_from_azure
SHAREPOINT_TENANT_ID=your_tenant_id
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/ChecklistSystem
SHAREPOINT_FOLDER_NAME=Checklists
SHAREPOINT_MAX_RETRIES=3
SHAREPOINT_RETRY_DELAY_MS=1000
```

## Flow Diagram

```
User completes checklist
         ↓
Submit form → Generate PDF ✅
         ↓
PDF saved to local server ✅
         ↓
[ASYNC] Trigger SharePoint upload
         ↓
Create folder: /Checklists/[Template]/[ID]/
         ↓
Upload: metadata.json, result.pdf, photos
         ↓
Success? → Log success (no user notification)
         ↓
Failure? → Retry (3x with exponential backoff)
         ↓
All retries failed? → Log error, show warning toast to user
         ↓
User sees Success page with status indicator
```

## Error Handling

### Retry Strategy

- **Attempt 1:** Immediate
- **Attempt 2:** Wait 1 second, retry
- **Attempt 3:** Wait 2 seconds, retry
- **Failed:** Log error, show user warning

### Error Types and Handling

| Error | Cause | User Message | Log Level |
|-------|-------|--------------|-----------|
| Invalid credentials | Auth failed | "Cloud save configuration issue" | ERROR |
| Network timeout | Connection lost | "Could not reach cloud storage" | WARN |
| Quota exceeded | Storage full | "Cloud storage quota exceeded" | ERROR |
| Folder not found | SharePoint path invalid | "Cloud folder not found" | ERROR |
| Partial upload | Some files failed | "Some files not uploaded" | WARN |
| Unknown error | Other failures | "Cloud save failed" | ERROR |

### User Experience on Error

1. Toast notification appears: "⚠️ Checklist saved locally, but cloud save failed"
2. User can still download PDF
3. Optional: "Retry" button on success page
4. No blocking or errors - checklist is complete

## Azure Setup Process (Admin)

### Prerequisites
- Organization has Microsoft 365 account
- Admin access to Azure Portal
- Admin access to SharePoint

### Step-by-Step Setup

**Step 1: Create App Registration in Azure**
1. Go to https://portal.azure.com
2. Navigate to "App registrations"
3. Click "New registration"
4. Name: "Checklist System"
5. Supported account types: "Single tenant"
6. Click "Register"
7. Copy and save:
   - Application (client) ID
   - Directory (tenant) ID

**Step 2: Create Client Secret**
1. In App registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "Checklist system secret"
4. Expiry: 24 months
5. Copy and save the secret value (only visible once!)

**Step 3: Grant API Permissions**
1. In App registration, go to "API permissions"
2. Click "Add a permission"
3. Select "Microsoft Graph"
4. Select "Application permissions"
5. Search and add:
   - `Sites.ReadWrite.All` (read/write to SharePoint)
   - `Files.ReadWrite.All` (read/write files)
6. Click "Grant admin consent"

**Step 4: Create SharePoint Folder**
1. Go to SharePoint site: https://yourorg.sharepoint.com/sites/ChecklistSystem
2. Create folder named "Checklists"
3. Get folder URL (copy from address bar)

**Step 5: Configure `.env`**
```env
SHAREPOINT_ENABLED=true
SHAREPOINT_CLIENT_ID=<from Step 1>
SHAREPOINT_CLIENT_SECRET=<from Step 2>
SHAREPOINT_TENANT_ID=<from Step 1>
SHAREPOINT_SITE_URL=https://yourorg.sharepoint.com/sites/ChecklistSystem
SHAREPOINT_FOLDER_NAME=Checklists
```

**Step 6: Test Connection**
1. Restart backend: `npm start`
2. Check logs for: "SharePoint connection validated"
3. Complete a test checklist
4. Check SharePoint for uploaded files

## Database Changes

### Optional: Track Upload Status

Add column to `checklists` table:
```sql
ALTER TABLE checklists ADD COLUMN sharepoint_upload_status VARCHAR(20) DEFAULT 'pending';
-- Values: pending, success, failed, partial
```

This allows admins to see which checklists were uploaded successfully.

## Testing Strategy

### Unit Tests
- Test SharePoint service (mock Microsoft Graph API)
- Test retry logic
- Test folder path generation
- Test metadata JSON generation

### Integration Tests
- Test actual upload to SharePoint (test environment)
- Test with photos
- Test error handling
- Test retry mechanism

### Manual Tests
1. **Happy path:** Complete checklist → PDF generated → Files appear in SharePoint ✅
2. **Network failure:** Disconnect internet → See warning → Reconnect → Verify retry works ✅
3. **Invalid credentials:** Wrong secret → See error logged, user not blocked ✅
4. **Large files:** Upload with 20+ photos → Verify all uploaded ✅
5. **Concurrent uploads:** Multiple users completing checklists simultaneously ✅

## Security Considerations

- **Client Secret:** Store in `.env`, never commit to git
- **Folder Access:** Limit to specific SharePoint folder (least privilege)
- **User Data:** Metadata includes user name/email - only admins should access SharePoint
- **File Permissions:** SharePoint files inherit site permissions
- **Audit:** All uploads logged with timestamp and user

## Performance

- **Upload speed:** ~2-5 seconds per checklist (depends on photo count/size)
- **Async operation:** No impact on user experience (non-blocking)
- **Network:** Uses Microsoft Graph API (reliable, throttled)
- **Storage:** ~2-5 MB per checklist (PDF + photos)

## Future Enhancements

- Email notification when upload succeeds
- Ability to sync local PDFs to SharePoint manually
- Admin dashboard showing upload statistics
- Integration with Power Automate workflows
- Archive old checklists to different folder

## Success Criteria

- ✅ Auto-upload triggers after PDF generation
- ✅ Correct folder structure created in SharePoint
- ✅ All files uploaded (PDF, photos, metadata)
- ✅ Retry logic works with exponential backoff
- ✅ Error notifications clear and user-friendly
- ✅ Non-blocking (checklist completion not delayed)
- ✅ Credentials secure in environment variables
- ✅ Admin setup documented and repeatable
- ✅ Logs provide debugging information

## Out of Scope

- Email notifications on upload
- Web UI for SharePoint folder management
- Automatic deletion of old checklists
- Integration with other cloud providers
- Encrypted storage of files
