# 🧪 Postman Testing Guide - Step by Step

## 📥 Setup Postman

### Option 1: Download Postman Desktop App

1. Go to https://www.postman.com/downloads/
2. Download and install
3. Create free account (optional but recommended)

### Option 2: Use Postman Web

1. Go to https://web.postman.com/
2. Sign in or create account

### Option 3: Use Thunder Client (VS Code Extension)

1. Open VS Code
2. Go to Extensions
3. Search "Thunder Client"
4. Install

---

## 🚀 Testing Authentication - Complete Walkthrough

### ✅ Test 1: Register New User

**Step 1:** Create New Request

- Click "New" → "HTTP Request"
- Or click "+" tab

**Step 2:** Configure Request

- **Method:** POST (dropdown on left)
- **URL:** `http://localhost:5000/api/auth/register`

**Step 3:** Set Headers

- Click "Headers" tab
- Add header:
  - Key: `Content-Type`
  - Value: `application/json`

**Step 4:** Set Body

- Click "Body" tab
- Select "raw"
- Select "JSON" from dropdown (right side)
- Enter this JSON:

```json
{
  "email": "test@example.com",
  "password": "test123",
  "name": "Test User"
}
```

**Step 5:** Send Request

- Click "Send" button
- Wait for response

**Expected Response (Status: 201 Created):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NSIsImlhdCI6MTcwNzE1MzYwMCwiZXhwIjoxNzA3NzU4NDAwfQ.abc123...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "test@example.com",
    "profile": {
      "name": "Test User",
      "avatar": ""
    },
    "preferences": {
      "theme": "light",
      "defaultColor": "#007bff"
    },
    "createdAt": "2024-02-05T21:00:00.000Z"
  }
}
```

**✨ Important:** Copy the `token` value! You'll need it for protected routes.

**What Just Happened:**

1. Postman sent POST request to backend
2. Backend received data
3. Controller validated email/password
4. Model hashed password
5. MongoDB stored user
6. Backend generated JWT token
7. Response sent back to Postman

---

### ✅ Test 2: Login User

**Step 1:** Create New Request

- Click "+" for new tab

**Step 2:** Configure Request

- **Method:** POST
- **URL:** `http://localhost:5000/api/auth/login`

**Step 3:** Set Headers

- Key: `Content-Type`
- Value: `application/json`

**Step 4:** Set Body (JSON)

```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

**Step 5:** Send Request

**Expected Response (Status: 200 OK):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "test@example.com",
    "profile": {
      "name": "Test User",
      "avatar": ""
    }
  }
}
```

**✨ Copy this token too!**

---

### ✅ Test 3: Get User Profile (Protected Route)

**Step 1:** Create New Request

- Click "+" for new tab

**Step 2:** Configure Request

- **Method:** GET
- **URL:** `http://localhost:5000/api/auth/profile`

**Step 3:** Set Authorization Header

- Click "Headers" tab
- Add header:
  - Key: `Authorization`
  - Value: `Bearer YOUR_TOKEN_HERE`

**Example:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ Important:**

- Must include the word "Bearer"
- One space after "Bearer"
- Then paste your token

**Step 4:** Send Request

**Expected Response (Status: 200 OK):**

```json
{
  "success": true,
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "test@example.com",
    "profile": {
      "name": "Test User",
      "avatar": ""
    },
    "preferences": {
      "theme": "light",
      "defaultColor": "#007bff"
    },
    "createdAt": "2024-02-05T21:00:00.000Z"
  }
}
```

**What Just Happened:**

1. Postman sent GET request with JWT token
2. Backend received request
3. Middleware extracted token from header
4. Middleware verified token with JWT_SECRET
5. Middleware decoded token to get user ID
6. Middleware fetched user from database
7. Controller accessed req.user
8. Response sent back

---

### ✅ Test 4: Update Profile (Protected Route)

**Step 1:** Create New Request

- **Method:** PUT
- **URL:** `http://localhost:5000/api/auth/profile`

**Step 2:** Set Headers

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Step 3:** Set Body (JSON)

```json
{
  "name": "Updated Name",
  "theme": "dark",
  "defaultColor": "#28a745"
}
```

**Step 4:** Send Request

**Expected Response (Status: 200 OK):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "test@example.com",
    "profile": {
      "name": "Updated Name",
      "avatar": ""
    },
    "preferences": {
      "theme": "dark",
      "defaultColor": "#28a745"
    }
  }
}
```

---

### ✅ Test 5: Change Password (Protected Route)

**Step 1:** Create New Request

- **Method:** PUT
- **URL:** `http://localhost:5000/api/auth/change-password`

**Step 2:** Set Headers

- `Content-Type: application/json`
- `Authorization: Bearer YOUR_TOKEN_HERE`

**Step 3:** Set Body (JSON)

```json
{
  "currentPassword": "test123",
  "newPassword": "newpassword456"
}
```

**Step 4:** Send Request

**Expected Response (Status: 200 OK):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Step 5:** Test New Password

- Try logging in with old password → Should fail
- Try logging in with new password → Should succeed

---

## 🚨 Error Testing

### Test 6: Register with Existing Email

**Request:**

```json
{
  "email": "test@example.com",
  "password": "test123",
  "name": "Another User"
}
```

**Expected Response (Status: 400 Bad Request):**

```json
{
  "success": false,
  "message": "User already exists with this email"
}
```

---

### Test 7: Login with Wrong Password

**Request:**

```json
{
  "email": "test@example.com",
  "password": "wrongpassword"
}
```

**Expected Response (Status: 401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 8: Access Protected Route Without Token

**Request:**

- GET `http://localhost:5000/api/auth/profile`
- **No Authorization header**

**Expected Response (Status: 401 Unauthorized):**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### Test 9: Access Protected Route with Invalid Token

**Request:**

- GET `http://localhost:5000/api/auth/profile`
- Authorization: `Bearer invalid_token_here`

**Expected Response (Status: 401 Unauthorized):**

```json
{
  "success": false,
  "message": "Not authorized, token failed"
}
```

---

## 📋 Postman Collection Setup (Advanced)

### Create Collection

1. Click "Collections" in left sidebar
2. Click "+" to create new collection
3. Name it "Note Taking App API"

### Add Requests to Collection

1. Save each request to the collection
2. Organize by folders:
   - Authentication
   - Notes (future)
   - Notebooks (future)
   - Tags (future)

### Use Environment Variables

1. Click "Environments" (left sidebar)
2. Create new environment "Development"
3. Add variables:
   - `base_url`: `http://localhost:5000`
   - `token`: (leave empty, will be set dynamically)

4. Use in requests:
   - URL: `{{base_url}}/api/auth/register`
   - Header: `Bearer {{token}}`

### Auto-Set Token (Advanced)

In Login request, go to "Tests" tab:

```javascript
// Parse response
const response = pm.response.json();

// Save token to environment
if (response.token) {
  pm.environment.set("token", response.token);
}
```

Now token is automatically saved after login!

---

## 🎯 Testing Checklist

- [ ] Register new user (success)
- [ ] Register with existing email (error)
- [ ] Login with correct credentials (success)
- [ ] Login with wrong password (error)
- [ ] Get profile with valid token (success)
- [ ] Get profile without token (error)
- [ ] Get profile with invalid token (error)
- [ ] Update profile (success)
- [ ] Change password (success)
- [ ] Login with new password (success)

---

## 🔍 Debugging Tips

### Check Server Logs

Look at your terminal where server is running:

```
🚀 Server running on port 5000
POST /api/auth/register 201 150ms
POST /api/auth/login 200 80ms
GET /api/auth/profile 200 25ms
```

### Common Issues

**1. Cannot connect to server**

- Check if server is running: `npm run dev` in server folder
- Check URL: `http://localhost:5000` (not 5173)

**2. CORS Error**

- Server should have CORS enabled for port 5173
- Check `server.js` has `app.use(cors(...))`

**3. Token not working**

- Check format: `Bearer <space> token`
- Token might be expired (default: 7 days)
- Generate new token by logging in again

**4. 500 Internal Server Error**

- Check server terminal for error details
- Usually database connection or code error

---

## 📊 Response Status Codes

- **200 OK** - Success (GET, PUT)
- **201 Created** - Resource created (POST register)
- **400 Bad Request** - Validation error
- **401 Unauthorized** - Authentication failed
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## 🎓 What You're Testing

1. **Registration Flow**
   - Data validation
   - Password hashing
   - User creation in database
   - JWT token generation

2. **Login Flow**
   - Email lookup
   - Password comparison
   - Token generation

3. **Protected Routes**
   - Token verification
   - User authentication
   - Data access control

4. **Error Handling**
   - Validation errors
   - Authentication errors
   - Database errors

---

**Ready to test?** Start with Test 1 (Register) and work your way through! 🚀
