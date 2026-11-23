# Query Performance Analysis

## 1. Test Environment

- Database: PostgreSQL
- PostgreSQL version: 16.14
- Database name: moodbeats_db
- Dataset: Synthetic test data
- Users: 1,000
- Study sessions: 100,000
- Pre-session check-ins: 100,000
- Post-session check-ins: 100,000
- Benchmark user: user_id = 42

The database was populated with synthetic data and ANALYZE was run before benchmarking.

## 2. Indexes Used

The study_session table uses the following indexes:

- idx_study_session_user_timestamp (user_id, session_timestamp)
- idx_study_session_task (task_id)
- idx_study_session_audio (audio_id)

Primary-key indexes are also used for user, goal, audio, task and check-in lookups.

## 3. Query Execution Timings

All queries were measured using EXPLAIN (ANALYZE, BUFFERS).

| Query | Execution Time |
|---|---:|
| Total study time | 4.957 ms |
| Recent 4 sessions | 0.127 ms |
| Focus trends | 3.471 ms |
| Average mood, focus and stress changes | 3.465 ms |
| Top audio environment | 3.784 ms |
| Weekly goal progress | 0.303 ms |

## 4. Query Plan Observations

### Total Study Time
- Uses Bitmap Index Scan on idx_study_session_user_timestamp.
- Retrieves sessions for the selected user before aggregation.

### Recent Sessions
- Uses Index Scan Backward on idx_study_session_user_timestamp.
- LIMIT 4 allows PostgreSQL to retrieve only the latest four matching sessions.

### Focus Trends
- Uses the user/timestamp index to locate relevant study sessions.
- Uses nested-loop joins and primary-key indexes to retrieve pre-session and post-session check-ins.
- Aggregates results by date.

### Mood, Focus and Stress Changes
- Uses the user/timestamp index to filter study sessions.
- Uses primary-key indexes for check-in lookups.
- Calculates average changes through aggregation.

### Top Audio Environment
- Uses the user/timestamp index and primary-key indexes for check-in lookups.
- Groups sessions by audio environment.
- Uses top-N heapsort to return the highest average focus improvement.

### Weekly Goal Progress
- Uses an Index Only Scan on users_pkey.
- Uses the study_goal primary-key index.
- Uses idx_study_session_user_timestamp to filter sessions from the last seven days.

## 5. Performance Analysis

- Recent sessions retrieval was the fastest query at 0.127 ms.
- Weekly goal progress took 0.303 ms.
- Total study time took 4.957 ms.
- Queries involving check-in joins and aggregations took approximately 3.4–3.8 ms.
- The composite user/timestamp index supports user-specific filtering and recent-session retrieval.
- Primary-key indexes make individual check-in lookups efficient.

## 6. Conclusion

The benchmark shows that PostgreSQL can efficiently execute the selected MoodBeats dashboard queries on the synthetic dataset of 100,000 study sessions.

The composite index on (user_id, session_timestamp) supports the main user-specific queries, while primary-key indexes support related table lookups.

Execution times represent individual local benchmark runs and may vary with cache state and system load.

## 7. Execution Plans

Detailed EXPLAIN ANALYZE output is stored in the dbms/plans/ directory.
