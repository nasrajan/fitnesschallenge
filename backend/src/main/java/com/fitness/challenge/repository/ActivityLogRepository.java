package com.fitness.challenge.repository;

import com.fitness.challenge.entity.ActivityLog;
import com.fitness.challenge.entity.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findByUserEmailAndMetricAndLoggedAtBetween(
            String userEmail, Metric metric, LocalDateTime start, LocalDateTime end);
}
