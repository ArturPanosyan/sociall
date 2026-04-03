package com.socialnet.controller;

import com.socialnet.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    // GET /api/search?q=text&page=0&size=20
    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(searchService.globalSearch(q, page, size));
    }

    // GET /api/search/autocomplete?prefix=jo
    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(@RequestParam String prefix) {
        return ResponseEntity.ok(searchService.autocomplete(prefix));
    }

    // GET /api/search/trending
    @GetMapping("/hashtags")
    public ResponseEntity<List<Map<String, Object>>> hashtags() {
        return ResponseEntity.ok(searchService.trendingHashtags());
    }
}