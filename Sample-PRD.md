# Product Requirements Document (PRD)

## Product Name

**FlowBoard**

## Product Vision

FlowBoard is a lightweight, real-time task management web application based on **kanban boards**, allowing individuals and teams to organize work visually through boards, lists, and cards.

The system prioritizes:

* **Extreme clarity of task structure**
* **Fast interaction**
* **Real-time collaboration**
* **Agent-friendly APIs for automation**

FlowBoard should feel **as simple as sticky notes on a wall**, while still supporting modern collaboration features.

---

# 1. Core Concept

FlowBoard is built around **four primitives**:

```
Workspace
Board
List
Card
```

Hierarchy:

```
Workspace
 └── Board
      └── List
           └── Card
```

### Workspace

Represents an organization or team.

### Board

A project or workflow container.

### List

A column in the workflow (e.g. "Todo", "Doing", "Done").

### Card

A single work item.

---

# 2. Target Users

### Individual users

People managing personal projects or tasks.

### Small teams

Startups and product teams managing workflow.

### Developers

Using FlowBoard to manage issues or roadmap items.

---

# 3. Key Use Cases

### Task Tracking

User creates a board:

```
Launch Website
```

Lists:

```
Backlog
In Progress
Review
Done
```

Cards:

```
Design landing page
Write blog post
Deploy staging
```

Cards move across lists as work progresses.

---

### Sprint Planning

Engineering team uses boards to track:

```
Sprint Backlog
Doing
Blocked
Done
```

---

### Content Pipeline

Marketing team workflow:

```
Ideas
Writing
Editing
Published
```

---

# 4. Functional Requirements

## 4.1 Authentication

Users must be able to:

* Create account
* Log in
* Log out
* Reset password

Authentication methods:

* Email/password
* OAuth (Google, GitHub)

---

# 4.2 Workspaces

Users can:

* Create workspace
* Invite members
* Assign roles

Roles:

```
Owner
Admin
Member
Viewer
```

Permissions:

| Action        | Owner | Admin | Member | Viewer |
| ------------- | ----- | ----- | ------ | ------ |
| Create boards | ✓     | ✓     | ✓      |        |
| Edit boards   | ✓     | ✓     | ✓      |        |
| Delete boards | ✓     | ✓     |        |        |
| View boards   | ✓     | ✓     | ✓      | ✓      |

---

# 4.3 Boards

Users can:

* Create board
* Rename board
* Delete board
* Invite users to board

Board metadata:

```
id
workspace_id
title
description
created_at
created_by
visibility
```

Visibility options:

```
private
workspace
public
```

---

# 4.4 Lists

Lists represent workflow stages.

Users can:

* Create list
* Rename list
* Delete list
* Reorder lists
* Drag cards between lists

List schema:

```
id
board_id
title
position
created_at
```

---

# 4.5 Cards

Cards represent tasks.

Users can:

* Create card
* Edit title
* Edit description
* Assign users
* Add labels
* Add due date
* Attach files
* Comment
* Move between lists
* Archive card

Card schema:

```
id
list_id
title
description
position
created_at
created_by
due_date
archived
```

---

# 4.6 Card Features

### Labels

Used for categorization.

Examples:

```
Bug
Feature
Marketing
High Priority
```

---

### Comments

Users can comment on cards.

Comment schema:

```
id
card_id
user_id
text
created_at
```

---

### Attachments

Cards support attachments.

Allowed types:

```
images
documents
links
```

---

# 5. Drag and Drop Interaction

Core user interaction:

Users must be able to drag:

```
Card → different list
Card → reorder within list
List → reorder board columns
```

Requirements:

* Smooth animation
* Real-time updates for collaborators
* Conflict resolution

---

# 6. Real-Time Collaboration

Changes update instantly for all users.

Events:

```
card_created
card_moved
card_updated
comment_added
list_created
list_reordered
```

Implementation options:

* WebSockets
* Realtime event server

---

# 7. Notifications

Users receive notifications for:

* Card assignment
* Comment mention
* Due date reminders

Notification types:

```
in_app
email
```

---

# 8. Search

Users must be able to search by:

```
card title
description
labels
assigned user
```

---

# 9. Filtering

Users can filter board by:

```
assigned to me
label
due date
keyword
```

---

# 10. Activity Log

Boards maintain activity history.

Example log:

```
Daniel moved card "Design UI" to "In Progress"
Alex commented on "Deploy staging"
Maria added label "High Priority"
```

---

# 11. Non-Functional Requirements

## Performance

* Board load < 1 second
* Card move latency < 200ms

---

## Scalability

System must support:

```
10k users
100k boards
1M cards
```

---

## Security

Requirements:

* HTTPS only
* encrypted passwords
* role-based access control

---

## Availability

Target uptime:

```
99.9%
```

---

# 12. API Design

REST or GraphQL API.

Example endpoints:

### Boards

```
GET /boards
POST /boards
GET /boards/{id}
DELETE /boards/{id}
```

---

### Lists

```
POST /lists
PATCH /lists/{id}
DELETE /lists/{id}
```

---

### Cards

```
POST /cards
PATCH /cards/{id}
DELETE /cards/{id}
```

---

# 13. Suggested Architecture

Frontend:

```
React
Next.js
Tailwind
```

Backend:

```
Node.js
NestJS / Express
```

Database:

```
PostgreSQL
```

Realtime:

```
WebSockets
```

Storage:

```
S3 compatible
```

Auth:

```
JWT
OAuth
```

---

# 14. Data Model

Simplified schema:

```
User
Workspace
Board
List
Card
Comment
Label
Attachment
Notification
```

Relationships:

```
Workspace → Boards
Board → Lists
List → Cards
Card → Comments
Card → Attachments
```

---

# 15. MVP Scope

Initial release must support:

* User authentication
* Create boards
* Create lists
* Create cards
* Drag cards
* Basic collaboration

Not required for MVP:

* attachments
* automation
* advanced permissions

---

# 16. Future Features

### Automation rules

Example:

```
If card moved to "Done"
→ archive after 7 days
```

---

### AI features

Examples:

```
auto-summarize cards
suggest labels
generate tasks
```

---

### Integrations

Potential integrations:

```
Slack
GitHub
Jira
Google Drive
```

---

# 17. Success Metrics

Primary metrics:

```
daily active users
cards created per day
boards created per user
```

Secondary metrics:

```
card completion rate
team collaboration rate
```

---

# 18. Risks

### Feature creep

Too many features reduce simplicity.

### Real-time complexity

Concurrent editing may cause conflicts.

### Performance

Large boards may slow UI.

---

# 19. Development Milestones

Phase 1:

```
auth
board creation
lists
cards
```

Phase 2:

```
drag and drop
real time
comments
```

Phase 3:

```
notifications
search
filters
```

---

# 20. Guiding Principle

FlowBoard must remain:

```
simple
visual
fast
collaborative
```

The application should always prioritize **clarity of work structure over feature complexity**.
