# Challenge Engine Backend (v2)

This is a flexible, rule-based scoring engine designed for fitness, reading, and habit challenges.

## Tech Stack
- **Java 21**
- **Spring Boot 3.2+**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**

## Core Features
1. **Dynamic Metrics**: Create metrics like "Steps", "Pages", or "Workouts" without code changes.
2. **Flexible Frequencies**: Log and score at Daily, Weekly, or Monthly intervals.
3. **Rule-Based Scoring**: Points are awarded based on configurable thresholds and priority-based rules.
4. **Historical Recalculation**: Scores can be re-run at any time if rules change.

## Schema prefix: `v2_`
To avoid conflicts with the existing database, all tables in this engine are prefixed with `v2_`.

## Getting Started
### Prerequisites
- Java 21+ installed.

### Run the application
```bash
cd backend
./mvnw spring-boot:run
```

## API Endpoints
- `GET /api/v2/challenges`: List all challenges.
- `POST /api/v2/challenges`: Create a complex challenge with metrics and scoring rules.
- `POST /api/v2/challenges/{id}/recalculate/{email}`: Trigger score rollup for a specific user.
- `POST /api/v2/logs`: Submit raw activity data.
