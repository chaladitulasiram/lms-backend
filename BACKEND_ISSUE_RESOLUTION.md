# Backend Issue Resolution

## Date: 2026-01-16

---

## 🔍 **Issue Identified**

### **Error:** 403 Forbidden when adding lessons

**Root Cause:** User is logged in as a **STUDENT** but trying to perform **MENTOR** actions.

### **What Was Happening:**
1. User logged in as: `student_test@example.com` (STUDENT role)
2. Navigated to: `/mentor` dashboard
3. Attempted to: Add lesson to course
4. Backend response: `403 Forbidden` ❌

### **API Request:**
```
POST http://localhost:3000/courses/{courseId}/modules
Status: 403 Forbidden
Error: "Forbidden resource"
```

---

## ✅ **This is NOT a Bug - It's Security Working!**

The backend is **correctly** enforcing Role-Based Access Control (RBAC):

| Action | Required Role | Your Role | Result |
|--------|--------------|-----------|---------|
| Add Lesson | MENTOR | STUDENT | ❌ 403 Forbidden |
| Create Course | MENTOR | STUDENT | ❌ 403 Forbidden |
| Enroll in Course | STUDENT | STUDENT | ✅ Allowed |
| View Courses | Any Authenticated | STUDENT | ✅ Allowed |

---

## 🔧 **Solutions**

### **Option 1: Log In as a Mentor (Recommended)**

1. **Log out** from the current student account
2. **Log in** with a mentor account
3. **Create courses** and **add lessons**

#### **How to Create a Mentor Account:**

**Via Registration:**
```
1. Navigate to /register
2. Fill in email and password
3. After registration, update role in database:
   - Connect to PostgreSQL
   - Run: UPDATE "User" SET role = 'MENTOR' WHERE email = 'your@email.com';
```

**Via Direct Database:**
```sql
INSERT INTO "User" (id, email, password, role)
VALUES (
  gen_random_uuid(),
  'mentor@example.com',
  '$2b$10$...',  -- Hashed password
  'MENTOR'
);
```

### **Option 2: Frontend Role Protection (Recommended)**

Add role-based route protection to prevent students from accessing mentor pages:

**File:** `src/app/(dashboard)/layout.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Get user role from JWT token
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      
      // Redirect students away from mentor pages
      if (userRole === 'STUDENT' && pathname.startsWith('/mentor')) {
        router.push('/student');
      }
      
      // Redirect mentors away from student pages
      if (userRole === 'MENTOR' && pathname.startsWith('/student')) {
        router.push('/mentor');
      }
    }
  }, [pathname, router]);
  
  return <>{children}</>;
}
```

---

## 📊 **Backend Endpoints & Permissions**

### **Course Management (MENTOR Only)**

| Endpoint | Method | Permission | Purpose |
|----------|--------|------------|---------|
| `/courses` | POST | MENTOR | Create course |
| `/courses/:id/modules` | POST | MENTOR | Add lesson |

### **Course Access (Authenticated)**

| Endpoint | Method | Permission | Purpose |
|----------|--------|------------|---------|
| `/courses` | GET | Any | View catalog |
| `/courses/:id` | GET | Any | View course details |

### **Enrollment (STUDENT Only)**

| Endpoint | Method | Permission | Purpose |
|----------|--------|------------|---------|
| `/courses/:id/enroll` | POST | STUDENT | Enroll in course |

---

## 🎯 **Current User State**

Based on the browser investigation:

```json
{
  "email": "student_test@example.com",
  "role": "STUDENT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "canCreateCourses": false,
  "canAddLessons": false,
  "canEnroll": true
}
```

---

## 🚀 **Quick Fix Steps**

### **To Manage Courses:**

1. **Create a Mentor Account:**
   ```bash
   # Option A: Register and update role in database
   # Option B: Use existing mentor account if you have one
   ```

2. **Log Out:**
   - Click "Log Out" in the sidebar

3. **Log In as Mentor:**
   - Use mentor credentials
   - Navigate to `/mentor`
   - Create courses and add lessons ✅

### **To View Courses as Student:**

1. **Stay Logged In as Student**
2. **Navigate to `/student`**
3. **Enroll in courses** ✅
4. **View course content** ✅

---

## 📝 **Summary**

| Issue | Status |
|-------|--------|
| Backend RBAC | ✅ Working Correctly |
| API Endpoints | ✅ All Functional |
| Database Connection | ✅ Connected |
| Prisma Client | ✅ Generated |
| Frontend Navigation | ⚠️ Needs Role Protection |

**Action Required:** Log in with a MENTOR account to manage courses, or add frontend role-based redirects.

---

**Status:** ✅ **Backend is Working - User Needs Correct Role**
