-- ------------------------------------------------------------
-- MoodBeats – Proposed SQL Query Mapping
-- ------------------------------------------------------------
-- NOTE:
-- The current MoodBeats frontend stores all data in browser localStorage.
-- These queries are *proposed* equivalents that could be used if the data were
-- persisted in the PostgreSQL schema defined in dbms/03_schema.sql.  No
-- frontend code executes them today.
-- ------------------------------------------------------------
-- TIMEZONE CONSIDERATION:
-- Front‑end date calculations use the browser's local timezone.  When grouping
-- by DATE() in PostgreSQL, ensure the session_timestamp column is interpreted
-- in the same timezone (e.g., set the session time zone to the user's offset
-- or store timestamps in UTC and convert with AT TIME ZONE).  The queries
-- below use DATE(session_timestamp) which respects the current PostgreSQL
-- time‑zone setting.
-- ------------------------------------------------------------
-- PARAMETER CONVENTIONS (used throughout this file):
--   $1  = user_name (text) for INSERT INTO users
--   $2  = user_id   (bigint) – the target user
--   $3  = weekly_goal_minutes (integer) – supplied when upserting a goal
--   $4  = session_id (bigint)
--   $5  = user_id (bigint) – FK for session
--   $6  = task_id (bigint)
--   $7  = audio_id (varchar)
--   $8  = session_timestamp (timestamptz)
--   $9  = actual_minutes (integer)
--   $10 = target_minutes (integer 1‑180)
--   $11 = completion_type (varchar 'TIMER' or 'EARLY')
--   $12 = pre_mood (smallint 1‑5)
--   $13 = pre_stress (smallint 1‑10)
--   $14 = pre_focus (smallint 1‑10)
--   $15 = post_mood (smallint 1‑5)
--   $16 = post_stress (smallint 1‑10)
--   $17 = post_focus (smallint 1‑10)
--   $18 = task_completion (varchar – 'completed','partial','not_completed')
--   $19 = notes (text, nullable)
-- ------------------------------------------------------------

-- =============================================================
-- 1. USER & GOAL MANAGEMENT
-- =============================================================

-- WRITE: Insert a new user and return its generated identifier
INSERT INTO users (user_name)
VALUES ($1)
RETURNING user_id;

-- WRITE: Upsert (insert or update) a weekly study goal for a user
INSERT INTO study_goal (user_id, weekly_goal_minutes)
VALUES ($2, $3)
ON CONFLICT (user_id) DO UPDATE
SET weekly_goal_minutes = EXCLUDED.weekly_goal_minutes;

-- READ: Retrieve a user profile together with the current weekly goal
SELECT u.user_id,
       u.user_name,
       g.weekly_goal_minutes
FROM   users u
LEFT   JOIN study_goal g ON u.user_id = g.user_id
WHERE  u.user_id = $2;

-- =============================================================
-- 2. REFERENCE DATA (read‑only)
-- =============================================================

-- READ: List all audio types
SELECT audio_id,
       audio_name,
       audio_type
FROM   audio_type
ORDER  BY audio_id;

-- READ: List all study tasks
SELECT task_id,
       task_name
FROM   study_task
ORDER  BY task_id;

-- =============================================================
-- 3. STUDY SESSION LIFECYCLE
-- =============================================================

-- WRITE: Insert a completed study session (transaction with three INSERTs)
BEGIN;

-- WRITE: Insert into study_session
INSERT INTO study_session (
    session_id,
    user_id,
    task_id,
    audio_id,
    session_timestamp,
    actual_minutes,
    target_minutes,
    completion_type
) VALUES (
    $4,  -- session_id (BIGINT)
    $5,  -- user_id (BIGINT)
    $6,  -- task_id (BIGINT)
    $7,  -- audio_id (VARCHAR)
    $8,  -- session_timestamp (TIMESTAMPTZ)
    $9,  -- actual_minutes (INTEGER)
    $10, -- target_minutes (INTEGER, 1‑180)
    $11  -- completion_type (VARCHAR, 'TIMER' or 'EARLY')
);

-- WRITE: Insert pre‑check‑in
INSERT INTO pre_check_in (
    session_id,
    mood,
    stress,
    focus
) VALUES (
    $4,
    $12,
    $13,
    $14
);

-- WRITE: Insert post‑check‑in
INSERT INTO post_check_in (
    session_id,
    mood,
    stress,
    focus,
    task_completion,
    notes
) VALUES (
    $4,
    $15,
    $16,
    $17,
    $18,
    $19
);

COMMIT;

-- WRITE: Delete a study session (cascades to pre/post check‑ins)
DELETE FROM study_session
WHERE  session_id = $4;

-- READ: Retrieve a single session with full details
SELECT s.session_id,
       s.session_timestamp,
       s.actual_minutes,
       s.target_minutes,
       s.completion_type,
       t.task_name,
       a.audio_name,
       pre.mood   AS pre_mood,
       pre.stress AS pre_stress,
       pre.focus  AS pre_focus,
       post.mood   AS post_mood,
       post.stress AS post_stress,
       post.focus  AS post_focus,
       post.task_completion,
       post.notes
FROM   study_session s
JOIN   study_task t   ON s.task_id = t.task_id
JOIN   audio_type a   ON s.audio_id = a.audio_id
LEFT   JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT   JOIN post_check_in post ON s.session_id = post.session_id
WHERE  s.session_id = $4;

-- =============================================================
-- 4. DASHBOARD / REPORTING QUERIES
-- =============================================================

-- READ: Total study time (minutes and hours)
SELECT COALESCE(SUM(s.actual_minutes),0)                                     AS total_mins,
       ROUND(COALESCE(SUM(s.actual_minutes),0) / 60.0,1)                     AS total_hours
FROM   study_session s
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0;

-- READ: Completed sessions count
SELECT COUNT(*) AS completed_sessions
FROM   study_session s
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0;

-- READ: Current streak – unbounded consecutive days (today if present, else yesterday)
WITH RECURSIVE session_days AS (
    SELECT DISTINCT DATE(s.session_timestamp) AS day
    FROM   study_session s
    WHERE  s.user_id = $2
), start_day AS (
    SELECT day FROM (
        SELECT CURRENT_DATE AS day
        UNION ALL SELECT CURRENT_DATE - 1 AS day
    ) cand
    WHERE EXISTS (SELECT 1 FROM session_days sd WHERE sd.day = cand.day)
    ORDER BY day DESC
    LIMIT 1
), recursive_streak AS (
    SELECT day FROM start_day
    UNION ALL
    SELECT sd.day
    FROM recursive_streak rs
    JOIN session_days sd ON sd.day = rs.day - 1
)
SELECT COUNT(*) AS streak
FROM   recursive_streak;

-- READ: Weekly goal progress (rolling 7‑day window, goal taken from study_goal)
SELECT COALESCE(SUM(s.actual_minutes),0)                                    AS week_mins,
       COALESCE(g.weekly_goal_minutes,0)                                   AS goal_minutes,
       CASE WHEN COALESCE(g.weekly_goal_minutes,0) = 0 THEN 0
            ELSE LEAST(100,
                       ROUND(COALESCE(SUM(s.actual_minutes),0)::numeric /
                             NULLIF(g.weekly_goal_minutes,0) * 100))
       END                                                                AS goal_percent
FROM   users u
LEFT   JOIN study_goal g ON u.user_id = g.user_id
LEFT   JOIN study_session s
       ON s.user_id = u.user_id
      AND s.session_timestamp >= NOW() - INTERVAL '7 days'
      AND s.actual_minutes > 0
WHERE  u.user_id = $2
GROUP  BY g.weekly_goal_minutes;

-- READ: Focus trends – last 7 days (including days with no sessions)
SELECT d.day_date,
       to_char(d.day_date, 'Dy')                               AS day_name,
       to_char(d.day_date, 'MM-DD')                            AS day_month,
       COALESCE(SUM(s.actual_minutes),0)                        AS minutes,
       COUNT(s.session_id)                                      AS session_count,
       COALESCE(ROUND(AVG(COALESCE(post.focus,5) - COALESCE(pre.focus,5))::numeric,1),0)
           AS focus_delta
FROM (
    SELECT generate_series(
             CURRENT_DATE - INTERVAL '6 days',
             CURRENT_DATE,
             INTERVAL '1 day'
           )::date AS day_date
) d
LEFT JOIN study_session s
       ON s.user_id = $2
      AND s.actual_minutes > 0
      AND DATE(s.session_timestamp) = d.day_date
LEFT JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT JOIN post_check_in post ON s.session_id = post.session_id
GROUP BY d.day_date
ORDER BY d.day_date;

-- READ: Average mood / focus / stress changes (fallback values, include only sessions with minutes>0)
SELECT ROUND(AVG(COALESCE(post.focus,5) - COALESCE(pre.focus,5))::numeric,1)   AS avg_focus_delta,
       ROUND(AVG(COALESCE(pre.stress,5) - COALESCE(post.stress,5))::numeric,1) AS avg_stress_reduction,
       ROUND(AVG(COALESCE(post.mood,3) - COALESCE(pre.mood,3))::numeric,1)     AS avg_mood_delta
FROM   study_session s
LEFT   JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT   JOIN post_check_in post ON s.session_id = post.session_id
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0;

-- READ: Top audio environment (max average focus delta, using same fallbacks and LEFT joins)
SELECT a.audio_id,
       a.audio_name,
       ROUND(AVG(COALESCE(post.focus,5) - COALESCE(pre.focus,5))::numeric,1) AS avg_delta,
       COUNT(*)                                                             AS session_count
FROM   study_session s
JOIN   audio_type a   ON s.audio_id = a.audio_id
LEFT   JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT   JOIN post_check_in post ON s.session_id = post.session_id
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0
GROUP  BY a.audio_id, a.audio_name
ORDER  BY avg_delta DESC
LIMIT  1;

-- READ: Latest mood snapshot (fallback to pre‑mood, then default 3)
SELECT COALESCE(post.mood, pre.mood, 3) AS mood,
       s.session_timestamp               AS ts
FROM   study_session s
LEFT   JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT   JOIN post_check_in post ON s.session_id = post.session_id
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0
ORDER  BY s.session_timestamp DESC
LIMIT  1;

-- READ: Recent 4 sessions (most recent first) with full details
SELECT s.session_id,
       s.session_timestamp,
       s.actual_minutes,
       t.task_name,
       a.audio_name,
       pre.mood   AS pre_mood,
       pre.stress AS pre_stress,
       pre.focus  AS pre_focus,
       post.mood   AS post_mood,
       post.stress AS post_stress,
       post.focus  AS post_focus,
       post.task_completion,
       post.notes
FROM   study_session s
JOIN   study_task t   ON s.task_id = t.task_id
JOIN   audio_type a   ON s.audio_id = a.audio_id
LEFT   JOIN pre_check_in  pre  ON s.session_id = pre.session_id
LEFT   JOIN post_check_in post ON s.session_id = post.session_id
WHERE  s.user_id = $2
  AND  s.actual_minutes > 0
ORDER  BY s.session_timestamp DESC
LIMIT  4;

-- =============================================================
-- END OF FILE
-- =============================================================
