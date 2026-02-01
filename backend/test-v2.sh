#!/bin/bash

# Base URL
BASE_URL="http://localhost:8080/api/v2"

echo "1. Creating a '2026 Reading Marathon' Challenge..."
CHALLENGE_JSON='{
  "name": "2026 Reading Marathon",
  "description": "Read more, win more!",
  "start_date": "2026-01-01",
  "end_date": "2026-12-31",
  "logging_frequency": "DAILY",
  "scoring_frequency": "WEEKLY",
  "metrics": [
    {
      "name": "Pages Read",
      "unit": "pages",
      "aggregation_method": "SUM",
      "scoring_rules": [
        { "threshold_min": 0, "threshold_max": 49, "points": 1, "priority": 1 },
        { "threshold_min": 50, "threshold_max": 99, "points": 5, "priority": 2 },
        { "threshold_min": 100, "points": 10, "priority": 3 }
      ]
    }
  ]
}'

CHALLENGE_RES=$(curl -s -X POST "$BASE_URL/challenges" -H "Content-Type: application/json" -d "$CHALLENGE_JSON")
CHALLENGE_ID=$(echo $CHALLENGE_RES | grep -o '"id":"[^"]*' | cut -d'"' -f4)

echo "Challenge created with ID: $CHALLENGE_ID"

echo "2. Logging 120 pages for test@user.com on 2026-01-10..."
LOG_JSON='{
  "user_email": "test@user.com",
  "metric": { "id": "'$(echo $CHALLENGE_RES | grep -o '"id":"[^"]*' | head -n 2 | tail -n 1 | cut -d'"' -f4)'" },
  "raw_value": 120,
  "logged_at": "2026-01-10T10:00:00"
}'

curl -s -X POST "$BASE_URL/logs" -H "Content-Type: application/json" -d "$LOG_JSON"

echo -e "\n3. Triggering Recalculation..."
curl -s -X POST "$BASE_URL/challenges/$CHALLENGE_ID/recalculate/test@user.com"

echo -e "\nDone. You can now check the v2_scores table in the database to see the 10 points awarded for the 100+ pages rule."
