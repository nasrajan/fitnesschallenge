package com.fitness.challenge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "v2_scoring_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoringRule {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metric_id")
    private Metric metric;

    @Column(name = "threshold_min", nullable = false)
    private Double thresholdMin;

    @Column(name = "threshold_max")
    private Double thresholdMax;

    @Column(nullable = false)
    private Integer points;

    private Integer priority;
}
