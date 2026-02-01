package com.fitness.challenge.service;

import com.fitness.challenge.entity.*;
import com.fitness.challenge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoringServiceImpl implements ScoringService {

    private final ChallengeRepository challengeRepository;
    private final ActivityLogRepository logRepository;
    private final ScoreRepository scoreRepository;

    @Override
    @Transactional
    public void recalculateChallengeScores(UUID challengeId) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        // In a real app, you'd find all unique users who have logs for this challenge
        // For now, we'll assume a way to trigger for active users
    }

    @Override
    @Transactional
    public void recalculateUserScores(UUID challengeId, String userEmail) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));

        List<Period> periods = calculatePeriods(challenge);

        for (Period period : periods) {
            int totalPeriodScore = 0;

            for (Metric metric : challenge.getMetrics()) {
                double aggregatedValue = aggregateLogs(userEmail, metric, period);
                totalPeriodScore += calculatePoints(aggregatedValue, metric.getScoringRules());
            }

            saveOrUpdateScore(userEmail, challenge, period, totalPeriodScore);
        }
    }

    private List<Period> calculatePeriods(Challenge challenge) {
        List<Period> periods = new ArrayList<>();
        LocalDate current = challenge.getStartDate();
        Frequency freq = challenge.getScoringFrequency();

        while (!current.isAfter(challenge.getEndDate())) {
            LocalDate end;
            if (freq == Frequency.DAILY) {
                end = current;
            } else if (freq == Frequency.WEEKLY) {
                end = current.plusDays(6);
            } else { // MONTHLY
                end = current.plusMonths(1).withDayOfMonth(1).minusDays(1);
            }

            if (end.isAfter(challenge.getEndDate()))
                end = challenge.getEndDate();

            periods.add(new Period(current, end));
            current = end.plusDays(1);
        }
        return periods;
    }

    private double aggregateLogs(String userEmail, Metric metric, Period period) {
        LocalDateTime start = period.start.atStartOfDay();
        LocalDateTime end = period.end.atTime(LocalTime.MAX);

        List<ActivityLog> logs = logRepository.findByUserEmailAndMetricAndLoggedAtBetween(userEmail, metric, start,
                end);
        if (logs.isEmpty())
            return 0;

        return switch (metric.getAggregationMethod()) {
            case SUM -> logs.stream().mapToDouble(ActivityLog::getRawValue).sum();
            case COUNT -> logs.size();
            case MAX -> logs.stream().mapToDouble(ActivityLog::getRawValue).max().orElse(0);
            case LAST -> logs.get(logs.size() - 1).getRawValue();
        };
    }

    private int calculatePoints(double value, List<ScoringRule> rules) {
        return rules.stream()
                .filter(rule -> value >= rule.getThresholdMin()
                        && (rule.getThresholdMax() == null || value <= rule.getThresholdMax()))
                .sorted(Comparator.comparingInt(ScoringRule::getPriority).reversed())
                .map(ScoringRule::getPoints)
                .findFirst()
                .orElse(0);
    }

    private void saveOrUpdateScore(String userEmail, Challenge challenge, Period period, int totalScore) {
        Score score = scoreRepository.findByUserEmailAndChallengeAndPeriodStart(userEmail, challenge, period.start)
                .orElse(Score.builder()
                        .userEmail(userEmail)
                        .challenge(challenge)
                        .periodStart(period.start)
                        .periodEnd(period.end)
                        .build());

        score.setPeriodScore(totalScore);
        scoreRepository.save(score);
    }

    private record Period(LocalDate start, LocalDate end) {
    }
}
