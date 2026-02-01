package com.fitness.challenge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "v2_scores", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_email", "challenge_id", "period_start"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenge_id")
    private Challenge challenge;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "period_score", nullable = false)
    private Integer periodScore;

    @Column(name = "last_recalculated")
    private LocalDateTime lastRecalculated;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastRecalculated = LocalDateTime.now();
    }
}
