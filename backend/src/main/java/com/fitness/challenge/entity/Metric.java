package com.fitness.challenge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "v2_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Metric {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(name = "aggregation_method", nullable = false)
    private AggregationMethod aggregationMethod;

    @OneToMany(mappedBy = "metric", cascade = CascadeType.ALL)
    private List<ScoringRule> scoringRules;
}
