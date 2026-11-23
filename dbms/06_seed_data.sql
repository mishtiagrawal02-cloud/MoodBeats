BEGIN;

-- Generate 1,000 users
INSERT INTO users (user_name)
SELECT 'user_' || n
FROM generate_series(1, 1000) AS n;

-- Generate weekly goals
INSERT INTO study_goal (user_id, weekly_goal_minutes)
SELECT user_id, 300 + (user_id % 10) * 60
FROM users;

-- Generate 100,000 study sessions
INSERT INTO study_session (
    session_id, user_id, task_id, audio_id,
    session_timestamp, actual_minutes,
    target_minutes, completion_type
)
SELECT
    n,
    ((n - 1) % 1000) + 1,
    ((n - 1) % 6) + 1,
    (ARRAY['lofi','instr','nature','freq','ambient','none'])
        [((n - 1) % 6) + 1],
    NOW() - (random() * INTERVAL '365 days'),
    1 + (n % 180),
    25 + ((n % 4) * 25),
    CASE WHEN n % 2 = 0 THEN 'TIMER' ELSE 'EARLY' END
FROM generate_series(1, 100000) AS n;

-- Generate pre-session check-ins
INSERT INTO pre_check_in (session_id, mood, stress, focus)
SELECT session_id,
       1 + (session_id % 5),
       1 + (session_id % 10),
       1 + (session_id % 10)
FROM study_session;

-- Generate post-session check-ins
INSERT INTO post_check_in (
    session_id, mood, stress, focus, task_completion, notes
)
SELECT session_id,
       1 + ((session_id + 1) % 5),
       1 + ((session_id + 2) % 10),
       1 + ((session_id + 3) % 10),
       CASE
           WHEN session_id % 3 = 0 THEN 'completed'
           WHEN session_id % 3 = 1 THEN 'partial'
           ELSE 'not_completed'
       END,
       'Synthetic test session'
FROM study_session;

COMMIT;
