package com.fitness.challenge.repository;

import com.fitness.challenge.entity.Metric;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface MetricRepository extends JpaRepository<Metric, UUID> {
}
