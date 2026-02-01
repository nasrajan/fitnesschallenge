package com.fitness.challenge.repository;

import com.fitness.challenge.entity.Score;
import com.fitness.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDate;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    Optional<Score> findByUserEmailAndChallengeAndPeriodStart(
            String userEmail, Challenge challenge, LocalDate periodStart);
}
