package com.fitness.challenge.controller;

import com.fitness.challenge.entity.ActivityLog;
import com.fitness.challenge.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LogController {

    private final ActivityLogRepository logRepository;

    @PostMapping
    public ActivityLog logActivity(@RequestBody ActivityLog log) {
        return logRepository.save(log);
    }
}
