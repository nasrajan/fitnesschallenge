package com.fitness.challenge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "v2_challenges")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "logging_frequency", nullable = false)
    private Frequency loggingFrequency;

    @Enumerated(EnumType.STRING)
    @Column(name = "scoring_frequency", nullable = false)
    private Frequency scoringFrequency;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "challenge", cascade = CascadeType.ALL)
    private List<Metric> metrics;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
