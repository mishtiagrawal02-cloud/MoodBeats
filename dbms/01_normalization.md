# MoodBeats - Database Normalization

## 1. Project Overview

MoodBeats is a study productivity application that allows users to track study sessions, select audio environments, record their mood and focus levels, and monitor weekly study goals.

The current application stores data in browser localStorage using JSON-based values. It does not currently use a relational database.

This document explains how the application's data can be organized into a normalized relational database schema.

## 2. Existing Data Storage

The application currently uses the following localStorage keys:

| Storage Key | Purpose |
|---|---|
| moodbeats:sessions | Stores completed study sessions |
| moodbeats:goal | Stores the weekly study goal |
| moodbeats:userName | Stores the user's name |
| moodbeats:preSession | Stores quick study preferences |
| moodbeats:activeSession | Stores the active study session |

The application also supports legacy storage keys for some data.

## 3. Proposed Relational Database Tables

The following tables are proposed for a normalized relational design.

### USER

| Attribute | Description |
|---|---|
| user_id (PK) | Unique user identifier |
| user_name | User's display name |

### STUDY_GOAL

| Attribute | Description |
|---|---|
| user_id (PK, FK) | References USER |
| weekly_goal_minutes | Weekly study goal |

### AUDIO_TYPE

| Attribute | Description |
|---|---|
| audio_id (PK) | Unique audio identifier |
| audio_name | Audio category name |
| audio_type | Audio category type |

### STUDY_TASK

| Attribute | Description |
|---|---|
| task_id (PK) | Unique task identifier |
| task_name | Study task name |

### STUDY_SESSION

| Attribute | Description |
|---|---|
| session_id (PK) | Unique session identifier |
| user_id (FK) | References USER |
| task_id (FK) | References STUDY_TASK |
| audio_id (FK) | References AUDIO_TYPE |
| session_timestamp | Session date and time |
| actual_minutes | Actual study duration |
| target_minutes | Planned study duration |
| completion_type | Timer or early completion |

### PRE_CHECK_IN

| Attribute | Description |
|---|---|
| session_id (PK, FK) | References STUDY_SESSION |
| mood | Pre-study mood rating |
| stress | Pre-study stress rating |
| focus | Pre-study focus rating |

### POST_CHECK_IN

| Attribute | Description |
|---|---|
| session_id (PK, FK) | References STUDY_SESSION |
| mood | Post-study mood rating |
| stress | Post-study stress rating |
| focus | Post-study focus rating |
| task_completion | Task completion status |
| notes | Optional session notes |

## 4. Functional Dependencies

The proposed database uses the following functional dependencies:

- user_id -> user_name
- user_id -> weekly_goal_minutes
- audio_id -> audio_name, audio_type
- task_id -> task_name
- session_id -> user_id, task_id, audio_id, session_timestamp, actual_minutes, target_minutes, completion_type
- session_id -> pre-study mood, stress, focus
- session_id -> post-study mood, stress, focus, task_completion, notes

## 5. First Normal Form (1NF)

A relation is in First Normal Form when:

- Every column contains atomic values.
- Each record is uniquely identifiable.
- There are no repeating groups or multivalued attributes.

### Application of 1NF

In the proposed design:

- Each table has a primary key.
- Each column stores a single value.
- Study sessions are stored as individual records.
- Pre-study and post-study check-in values are stored in separate columns.

Therefore, the proposed schema satisfies 1NF.

## 6. Second Normal Form (2NF)

A relation is in Second Normal Form when:

- It is already in 1NF.
- Every non-key attribute is fully functionally dependent on the entire candidate key.
- There are no partial dependencies.

### Application of 2NF

The proposed tables use single-column primary keys.

Each non-key attribute depends on the complete primary key of its respective table.

For example:

- user_name depends on user_id.
- audio_name depends on audio_id.
- task_name depends on task_id.
- Session attributes depend on session_id.

Therefore, there are no partial dependencies, and the proposed schema satisfies 2NF.

## 7. Third Normal Form (3NF)

A relation is in Third Normal Form when:

- It is already in 2NF.
- No non-key attribute is transitively dependent on a candidate key.

### Application of 3NF

The proposed design separates independent entities into different tables.

For example:

- Audio details are stored in AUDIO_TYPE instead of being repeated in every study session.
- Task details are stored in STUDY_TASK.
- User information is stored in USER.
- Weekly goals are stored separately in STUDY_GOAL.
- Pre-study and post-study check-in details are stored separately.

This avoids transitive dependencies such as:

session_id -> audio_id -> audio_name

and

session_id -> task_id -> task_name

Therefore, the proposed schema satisfies 3NF.

## 8. Boyce-Codd Normal Form (BCNF)

A relation is in Boyce-Codd Normal Form when, for every non-trivial functional dependency X -> Y, X must be a superkey.

### Application of BCNF

In the proposed design:

- user_id determines the attributes in USER and STUDY_GOAL.
- audio_id determines the attributes in AUDIO_TYPE.
- task_id determines the attributes in STUDY_TASK.
- session_id determines the attributes in STUDY_SESSION, PRE_CHECK_IN, and POST_CHECK_IN.

Each determinant is a candidate key or primary key of its respective relation.

No additional non-key determinant has been identified in these relations.

Therefore, the proposed schema satisfies BCNF under the stated functional dependency assumptions.

## 9. Benefits of Normalization

The proposed normalized design provides the following benefits:

1. Reduces repeated storage of audio and task names.
2. Improves data consistency.
3. Avoids update anomalies when audio or task information changes.
4. Avoids insertion and deletion anomalies caused by combining unrelated data.
5. Maintains clear relationships through primary and foreign keys.
6. Separates study session records from pre-study and post-study check-ins.
7. Makes future migration from localStorage to a relational database easier.

## 10. Assumptions

- Each user has one current weekly study goal.
- Each study session has at most one pre-study check-in and one post-study check-in.
- Custom study tasks can be stored as separate records in STUDY_TASK.
- The proposed user_id is included to support a future multi-user relational design.
- Active sessions are temporary application state and are not treated as completed study history.

## 11. Conclusion

MoodBeats currently uses browser localStorage to store JSON-based application data. Its existing storage structure is not a relational database schema.

The proposed relational design separates users, study goals, study sessions, audio types, study tasks, and check-in records into related tables.

The proposed schema satisfies 1NF, 2NF, 3NF, and BCNF under the functional dependencies and assumptions described above.
