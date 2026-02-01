package com.fitness.challenge.service;

import java.util.UUID;

public interface ScoringService {
    void recalculateChallengeScores(UUID challengeId);

    void recalculateUserScores(UUID challengeId, String userEmail);
}
