package com.fitness.challenge.repository;

import com.fitness.challenge.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {
}
