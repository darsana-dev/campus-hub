# Campus Hub

> A centralized digital platform for managing campus clubs, events, student participation, and campus activities.

**Campus Hub** is a full-stack campus engagement platform designed to bring students, clubs, and events into one organized ecosystem.

Instead of relying on scattered WhatsApp groups, posters, forms, and separate event pages, Campus Hub gives students a single place to **discover opportunities, participate in events, and stay connected with campus communities**.

---

## Why Campus Hub?

Campus activities are often fragmented across multiple channels:

* Event announcements are shared through different WhatsApp groups
* Registration happens through separate Google Forms
* Club information becomes difficult to discover
* Students miss opportunities because they don't know about them
* Organizers have to manage registrations and participant information manually
* Certificates and feedback are handled separately

Campus Hub aims to solve this by creating a **centralized campus activity layer**.

### The idea

**Discover → Register → Participate → Engage → Track**

---

## Features

### 🎓 Student Experience

* Discover upcoming campus events
* Browse events by category
* View detailed event information
* Register for events
* Track participation
* Access relevant event information from one place

### 🏛️ Club Management

* Dedicated club spaces
* Club-specific event management
* Create and manage events
* Draft and publish events
* Manage club activities from an admin dashboard

### 📅 Event Management

Each event can contain information such as:

* Title
* Short description
* Category
* Event status
* Registration details
* Event information
* Publishing state

Only published events are visible to students, while administrators can manage their own drafts and upcoming activities.

### 🔐 Authentication & Roles

Campus Hub uses role-based access to separate student and administrative functionality.

Users can access the appropriate experience based on their relationship with a campus club.

Planned role structure includes:

```text
User
 ├── Student
 │    ├── Discover Events
 │    ├── Register
 │    └── Track Participation
 │
 └── Club Admin
      ├── Manage Club
      ├── Create Events
      ├── Publish Events
      └── Manage Participants
```

---

## Tech Stack

### Frontend

* **TypeScript** — 93.6%
* React
* Modern component-based UI architecture
* CSS

### Backend / Database

* **PostgreSQL**
* **PL/pgSQL** — 4.5%
* Supabase-based backend infrastructure
* Authentication
* Database-level security and role management

### Supporting Technologies

* JavaScript — 0.4%
* CSS — 1.5%

---

## Architecture

At a high level, Campus Hub follows a modern full-stack architecture:

```text
┌──────────────────────────┐
│       Student / Admin    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     React + TypeScript   │
│       Web Application    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Supabase            │
│                          │
│  Authentication          │
│  PostgreSQL Database     │
│  Row Level Security      │
│  Backend Logic           │
└──────────────────────────┘
```

---

## Core Data Model

The platform is structured around the relationship between users, clubs, events, and participation.

```text
Users
  │
  ├──────────────┐
  │              │
  ▼              ▼
Students      Club Members
                 │
                 ▼
               Clubs
                 │
                 ▼
               Events
                 │
                 ▼
            Registrations
                 │
                 ▼
             Feedback
                 │
                 ▼
            Certificates
```

This structure allows the platform to grow beyond simple event listings into a complete campus engagement system.

---

## Project Structure

```text
campus-hub/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── integrations/
│   └── types/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── public/
│
├── package.json
├── tsconfig.json
└── README.md
```

---


## Contributing

Contributions, suggestions, and discussions are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "feat: add your feature"
```

4. Push the branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---

## License

This project is currently maintained as a personal/academic project.

License details will be added as the project evolves.

---

## Author

**Devadarsana R**

B.Tech Computer Science & Engineering

[GitHub](https://github.com/darsana-dev)

```
