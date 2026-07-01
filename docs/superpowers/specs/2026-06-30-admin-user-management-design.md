# Admin User Management Panel Design

**Date:** 2026-06-30  
**Project:** Checklist Management v2  
**Feature:** Admin User Management Panel

## Overview

Add a user management admin panel integrated into the Dashboard as a tab, visible only to admin role users. Admins can create, read, update, and delete users with full control over user properties.

## Access Control

- **Visibility:** Visible only to users with `role = 'admin'`
- **Backend Protection:** All `/api/admin/users/*` endpoints require admin authentication
- **Frontend Protection:** Tab only renders if `user.role === 'admin'`

## Data Model

### Database Changes

Add/verify these fields in the `users` table:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL;
```

**Field Definitions:**
- `password_reset_required` (boolean): Forces user to change password on first login
- `is_active` (boolean): Soft disable for account status control
- `last_login` (timestamp): Tracks user activity, updated on successful login

## Backend API Endpoints

All endpoints require admin role authentication.

### List Users
```
GET /api/admin/users?search=&role=&status=&page=1&limit=10
```

**Query Parameters:**
- `search` (string): Search by username, email, or full_name
- `role` (enum): Filter by 'admin' or 'user'
- `status` (enum): Filter by 'active' or 'inactive'
- `page` (number): Page number (default 1)
- `limit` (number): Items per page (default 10)

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user",
      "is_active": true,
      "created_at": "2026-01-15T10:00:00Z",
      "last_login": "2026-06-29T14:30:00Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

### Create User
```
POST /api/admin/users
```

**Request:**
```json
{
  "username": "jane_smith",
  "email": "jane@example.com",
  "full_name": "Jane Smith",
  "role": "user"
}
```

**Response:** (includes generated temporary password)
```json
{
  "id": 2,
  "username": "jane_smith",
  "email": "jane@example.com",
  "full_name": "Jane Smith",
  "role": "user",
  "is_active": true,
  "temporary_password": "Tmp@3kL9mQ2x",
  "password_reset_required": true,
  "created_at": "2026-06-30T10:00:00Z"
}
```

### Get User Details
```
GET /api/admin/users/:id
```

**Response:**
```json
{
  "id": 2,
  "username": "jane_smith",
  "email": "jane@example.com",
  "full_name": "Jane Smith",
  "role": "user",
  "is_active": true,
  "created_at": "2026-06-30T10:00:00Z",
  "last_login": null
}
```

### Update User
```
PUT /api/admin/users/:id
```

**Request:** (all fields optional)
```json
{
  "full_name": "Jane Smith Updated",
  "email": "jane.new@example.com",
  "role": "admin",
  "is_active": false
}
```

**Response:** Updated user object

### Change User Password
```
PUT /api/admin/users/:id/password
```

**Request:**
```json
{
  "new_password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "message": "Password changed successfully",
  "password_reset_required": false
}
```

### Delete User
```
DELETE /api/admin/users/:id
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Frontend Component Structure

### File Organization
```
frontend/src/
├── pages/
│   └── Dashboard.jsx (modified - add User Management tab)
├── components/
│   ├── UserManagement/
│   │   ├── UserManagementTab.jsx (main container/orchestrator)
│   │   ├── UserList.jsx (table with search/filter/pagination)
│   │   ├── UserForm.jsx (create/edit user modal)
│   │   ├── ChangePasswordForm.jsx (password change modal)
│   │   └── DeleteConfirmation.jsx (delete confirmation dialog)
│   └── ... (existing components)
└── services/
    └── userAPI.js (new API service)
```

### Component Specifications

**UserManagementTab.jsx**
- Container component managing state and API calls
- Controls: which modal is open, current editing user, list filters
- Handles: user create/update/delete operations and error handling

**UserList.jsx**
- Displays sortable table of users
- Columns: Username, Full Name, Email, Role, Status, Created Date, Last Login
- Features:
  - Search box (searches username/email/full_name in real-time)
  - Role filter dropdown
  - Status filter dropdown (active/inactive)
  - Pagination controls (10 items per page)
  - Edit button per row (opens UserForm in edit mode)
  - Delete button per row (opens DeleteConfirmation)

**UserForm.jsx**
- Modal form for creating or editing users
- Create mode: username, email, full_name, role, is_active, password (auto-generated, displayed once)
- Edit mode: full_name, email, role, is_active (no password field)
- Validation: real-time error messages, submit disabled if invalid
- Display temp password in highlighted alert on create
- "Change Password" button on edit mode

**ChangePasswordForm.jsx**
- Modal form for changing password
- Input: new password field (with strength indicator)
- Called from UserForm edit mode
- Validation: minimum 8 characters

**DeleteConfirmation.jsx**
- Confirmation dialog before deletion
- Shows warning: "This action cannot be undone"
- Prevent deletion of last admin user
- Prevent deletion of currently logged-in user

### Integration with Dashboard

**Dashboard.jsx modifications:**
- Add conditional tab for admins: `{user?.role === 'admin' && <div className="tab">👥 User Management</div>}`
- Create separate state for active tab
- Render `<UserManagementTab />` when admin tab is active
- Keep existing dashboard content in another tab (e.g., "📊 Dashboard")

## Validation Rules

### Username
- Alphanumeric + underscores only
- 3-20 characters
- Must be unique
- Case-insensitive storage

### Email
- Valid email format
- Must be unique
- Case-insensitive storage

### Password (on creation, auto-generated)
- 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Example: `Tmp@3kL9mQ2x`

### Password (when admin changes)
- Minimum 8 characters
- Can be any combination (no complexity requirements)

### Full Name
- Required
- Maximum 100 characters

### Cannot Delete
- Last remaining admin user (prevent lockout)
- Currently logged-in user

## Error Handling

**Backend Errors:**
- 400: Validation failed (duplicate email/username, invalid data)
- 401: Unauthorized (not admin)
- 403: Forbidden (cannot delete self or last admin)
- 404: User not found
- 500: Server error

**Frontend Error Display:**
- Toast notifications for API errors
- Inline validation messages in forms
- Disable buttons during API calls (prevent double submission)

## First Login Password Change Flow

When a user logs in with `password_reset_required = true`:

1. Login succeeds, token is issued
2. Frontend checks token/user object for `password_reset_required` flag
3. If true, redirect to `/change-password` page (new page)
4. User must change password before accessing dashboard
5. After change, `password_reset_required` is set to false
6. User is redirected to dashboard

**Implementation:**
- Add `password_reset_required` field to login response
- Create ChangePasswordRequired.jsx page
- Add check in ProtectedRoute or useEffect on Dashboard

## Security Considerations

- Admin endpoints protected by `authenticateToken` + admin role check middleware
- Passwords never returned in API responses (except temp password on creation)
- Password changes use POST/PUT to prevent caching
- Temporary passwords displayed once, not stored in database
- Admin cannot see other users' passwords
- Sensitive operations log to audit trail (optional future enhancement)

## Testing Scenarios

**Create User:**
- ✓ Admin creates new user with valid data
- ✓ Cannot create with duplicate email/username
- ✓ Temp password is displayed
- ✓ Non-admin cannot create

**List Users:**
- ✓ Admin sees all users
- ✓ Search filters correctly
- ✓ Role/status filters work
- ✓ Pagination works

**Update User:**
- ✓ Admin updates user details
- ✓ Cannot change to duplicate email
- ✓ Admin role promotion works
- ✓ Deactivating user works

**Delete User:**
- ✓ Admin can delete user
- ✓ Cannot delete self
- ✓ Cannot delete last admin
- ✓ Confirmation required

**First Login:**
- ✓ New user forced to change password
- ✓ Cannot access dashboard until password changed
- ✓ After change, normal access restored

## Out of Scope

- Audit logging (can be added later)
- Bulk user operations (import, export)
- User groups or permissions management
- Email notifications on account creation
- Password reset via email
- Two-factor authentication

## Success Criteria

- ✓ Admin users can view all users with search/filter
- ✓ Admin users can create new users with auto-generated temp passwords
- ✓ Admin users can update user details and roles
- ✓ Admin users can change user passwords
- ✓ Admin users can deactivate/delete users
- ✓ New users must change password on first login
- ✓ Non-admin users cannot access any admin features
- ✓ UI is clean, follows existing design patterns (like AdminTemplates)
