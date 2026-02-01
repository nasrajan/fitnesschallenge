package com.fitness.challenge.controller;

import com.fitness.challenge.entity.Challenge;
import com.fitness.challenge.repository.ChallengeRepository;
import com.fitness.challenge.service.ScoringService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v2/challenges")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChallengeController {

    private final ChallengeRepository challengeRepository;
    private final ScoringService scoringService;

    @GetMapping
    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    @PostMapping
    public Challenge createChallenge(@RequestBody Challenge challenge) {
        // In a real app, ensure relations (Metric -> Challenge) are set properly
        if (challenge.getMetrics() != null) {
            challenge.getMetrics().forEach(m -> {
                m.setChallenge(challenge);
                if (m.getScoringRules() != null) {
                    m.getScoringRules().forEach(r -> r.setMetric(m));
                }
            });
        }
        return challengeRepository.save(challenge);
    }

    @PostMapping("/{id}/recalculate/{email}")
    public ResponseEntity<?> recalculate(@PathVariable UUID id, @PathVariable String email) {
        scoringService.recalculateUserScores(id, email);
        return ResponseEntity.ok().build();
    }
}
