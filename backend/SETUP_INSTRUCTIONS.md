# MoodBeats Database Setup Instructions

This guide will help you set up a dedicated PostgreSQL user and database for MoodBeats.

## Prerequisites

✓ PostgreSQL is installed and running
✓ You have access to the `postgres` superuser account

## Step-by-Step Setup

### Step 1: Create the Database User

Navigate to the backend directory and run:

```bash
cd /Users/mishtiagarwal/Documents/projects/MB/MoodBeats/backend
./setup-db-user.sh
```

**What this does:**
- Creates a PostgreSQL user named `moodbeats_user`
- Prompts you to enter a password (input is hidden for security)
- Grants necessary privileges to the user

**Notes:**
- The password you enter will not be visible
- You'll be asked to confirm the password
- Remember this password - you'll need it for the next steps

---

### Step 2: Create the Database and Apply Schema

After creating the user, run:

```bash
./setup-database.sh
```

**What this does:**
- Creates a database named `moodbeats` owned by `moodbeats_user`
- Applies the schema from `../dbms/03_schema.sql`
- Grants appropriate permissions
- Verifies that all tables were created successfully

**Expected tables:**
- `users`
- `study_goal`
- `audio_type`
- `study_task`
- `study_session`
- `pre_check_in`
- `post_check_in`

---

### Step 3: Encode Your Password (If Needed)

If your password contains special characters like `@`, `:`, `/`, `?`, `#`, `!`, etc., you need to URL-encode it.

Run:

```bash
node encode-password.js
```

**What this does:**
- Prompts for your password (hidden input)
- Checks if URL-encoding is needed
- Outputs the encoded password if necessary
- Shows you the complete DATABASE_URL to use

---

### Step 4: Update .env File

Open `backend/.env` in your text editor and update the `DATABASE_URL` line:

**If your password has NO special characters:**
```env
DATABASE_URL=postgresql://moodbeats_user:your_password@localhost:5432/moodbeats
```

**If your password HAS special characters:**
```env
DATABASE_URL=postgresql://moodbeats_user:URL_ENCODED_PASSWORD@localhost:5432/moodbeats
```

Replace `your_password` or `URL_ENCODED_PASSWORD` with your actual password or encoded password.

**Important:**
- Never commit the `.env` file to Git
- It should already be in `.gitignore`

---

### Step 5: Verify the Database Connection

Start the backend server:

```bash
npm run dev
```

**What to look for:**
- Server starts successfully
- You should see: `✓ Database connected successfully at: [timestamp]`
- No database connection errors

Test the health endpoint:

```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{
  "success": true,
  "message": "MoodBeats API is running",
  "database": {
    "connected": true,
    "timestamp": "2024-11-18T..."
  },
  "environment": "development"
}
```

---

## Verification Checklist

Run these commands to verify everything is set up correctly:

### Check if database exists:
```bash
psql -U moodbeats_user -d moodbeats -c "\dt"
```

### Check if tables were created:
```bash
psql -U moodbeats_user -d moodbeats -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```
Expected result: 7 tables

### Test a simple query:
```bash
psql -U moodbeats_user -d moodbeats -c "SELECT NOW();"
```

### Check audio types (pre-populated data):
```bash
psql -U moodbeats_user -d moodbeats -c "SELECT * FROM audio_type;"
```

### Check study tasks (pre-populated data):
```bash
psql -U moodbeats_user -d moodbeats -c "SELECT * FROM study_task;"
```

---

## Troubleshooting

### "FATAL: password authentication failed"
- Make sure you're using the correct password
- Check if your password needs URL-encoding
- Run `node encode-password.js` to get the encoded version

### "FATAL: database 'moodbeats' does not exist"
- Run `./setup-database.sh` to create the database

### "ERROR: role 'moodbeats_user' does not exist"
- Run `./setup-db-user.sh` to create the user

### "Port 3001 already in use"
- Check if the backend is already running
- Kill the process: `lsof -ti:3001 | xargs kill -9`
- Or change the PORT in `.env`

### "Connection timeout"
- Check if PostgreSQL is running: `pg_isready`
- Start PostgreSQL if needed

---

## Security Notes

1. **Never commit `.env` file** - it contains your database password
2. **Use a strong password** for the database user
3. **URL-encode special characters** in the DATABASE_URL
4. **Don't share passwords** in logs or terminal history
5. **Use environment-specific credentials** (different passwords for dev/staging/production)

---

## What's Next?

After successful database setup:

1. ✓ Database user created
2. ✓ Database created with schema applied
3. ✓ Backend connects to PostgreSQL
4. ✓ Health endpoint reports database status

You're now ready to:
- Test authentication endpoints
- Create study sessions
- Store and retrieve user data
- Build out the remaining API features

---

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Verify PostgreSQL is running: `pg_isready`
3. Check the backend logs for detailed error messages
4. Verify your DATABASE_URL is correctly formatted
