# 🧪 API Testing Guide

## Authentication Endpoints

Base URL: `http://localhost:5000`

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\",\"name\":\"John Doe\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "profile": {
      "name": "John Doe",
      "avatar": ""
    },
    "preferences": {
      "theme": "light",
      "defaultColor": "#007bff"
    },
    "createdAt": "2024-02-05T..."
  }
}
```

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**cURL Command:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "profile": {
      "name": "John Doe",
      "avatar": ""
    }
  }
}
```

---

### 3. Get User Profile (Protected)

**Endpoint:** `GET /api/auth/profile`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Command:**

```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**

```json
{
  "success": true,
  "user": {
    "id": "65f1234567890abcdef12345",
    "email": "user@example.com",
    "profile": {
      "name": "John Doe",
      "avatar": ""
    },
    "preferences": {
      "theme": "light",
      "defaultColor": "#007bff"
    }
  }
}
```

---

### 4. Update Profile (Protected)

**Endpoint:** `PUT /api/auth/profile`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "theme": "dark",
  "defaultColor": "#28a745"
}
```

**cURL Command:**

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Doe\",\"theme\":\"dark\"}"
```

---

### 5. Change Password (Protected)

**Endpoint:** `PUT /api/auth/change-password`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## Testing with Postman/Thunder Client

### Step 1: Register a User

1. Create new POST request to `http://localhost:5000/api/auth/register`
2. Set body to JSON
3. Add email, password, name
4. Send request
5. **Copy the token from response**

### Step 2: Test Protected Routes

1. Create new GET request to `http://localhost:5000/api/auth/profile`
2. Go to Headers tab
3. Add header: `Authorization: Bearer YOUR_TOKEN_HERE`
4. Send request

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Please provide email and password"
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

## Quick Test Script

Save this as `test-auth.sh`:

```bash
#!/bin/bash

# Register user
echo "1. Registering user..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}')

echo $RESPONSE

# Extract token (requires jq)
TOKEN=$(echo $RESPONSE | jq -r '.token')

echo "\n2. Token: $TOKEN"

# Get profile
echo "\n3. Getting profile..."
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps

After testing authentication:

1. Create Notes API endpoints
2. Create Notebooks API endpoints
3. Create Tags API endpoints
4. Integrate with frontend
