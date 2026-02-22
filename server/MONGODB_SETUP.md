# 🔧 MongoDB Atlas Setup Instructions

## ⚠️ IMPORTANT: Update Your Password

Your `.env` file currently has a placeholder `<db_password>`. You need to replace it with your actual MongoDB Atlas password.

### Step 1: Update .env File

Open `server/.env` and find this line:

```
MONGODB_URI=mongodb+srv://alemugetu78_db_user:<db_password>@note-taking-app.ce49zrw.mongodb.net/?appName=Note-taking-app
```

Replace `<db_password>` with your actual password:

```
MONGODB_URI=mongodb+srv://alemugetu78_db_user:YourActualPassword123@note-taking-app.ce49zrw.mongodb.net/?appName=Note-taking-app
```

### Step 2: Verify MongoDB Atlas Settings

1. **Whitelist IP Address**
   - Go to MongoDB Atlas Dashboard
   - Navigate to: Network Access
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Or add your specific IP address

2. **Verify Database User**
   - Go to: Database Access
   - Ensure user `alemugetu78_db_user` exists
   - Verify password is correct
   - Check user has "Read and write to any database" permissions

### Step 3: Test Connection

Run the connection test:

```bash
cd server
npm run test:db
```

**Expected Output (Success):**

```
✅ SUCCESS! MongoDB Connected
📊 Host: note-taking-app.ce49zrw.mongodb.net
📁 Database: test
🔌 Connection State: Connected
```

**If Connection Fails:**

- Check password is correct (no < > brackets)
- Verify IP is whitelisted
- Ensure database user exists
- Check network connectivity

### Step 4: Start Server

Once connection test passes:

```bash
npm run dev
```

You should see:

```
✅ MongoDB Connected: note-taking-app.ce49zrw.mongodb.net
📊 Database: test
🚀 Server running on port 5000
```

## 🔐 Security Notes

1. **Never commit .env file** - It's already in .gitignore
2. **Use strong password** - Mix of letters, numbers, symbols
3. **Restrict IP in production** - Don't use 0.0.0.0/0
4. **Rotate credentials** - Change passwords periodically

## 📝 Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?<options>
```

Your details:

- Username: `alemugetu78_db_user`
- Cluster: `note-taking-app.ce49zrw.mongodb.net`
- Database: Will be created automatically
- App Name: `Note-taking-app`

## ❓ Troubleshooting

### Error: "Authentication failed"

- Wrong password in .env
- User doesn't exist or has wrong permissions

### Error: "IP not whitelisted"

- Add your IP in Network Access
- Or use 0.0.0.0/0 for development

### Error: "Connection timeout"

- Check internet connection
- Verify cluster is running
- Check firewall settings

## ✅ Next Steps After Connection

Once MongoDB is connected:

1. Create database models (User, Note, Notebook, Tag)
2. Build authentication system
3. Create API endpoints
4. Test with Postman/Thunder Client
