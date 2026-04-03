package com.socialnet.service;

import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import com.socialnet.repository.PostRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final UserRepository userRepo;
    private final PostRepository postRepo;

    // ─── Глобальный поиск ─────────────────────────────────────
    public Map<String, Object> globalSearch(String query, int page, int size) {
        Map<String, Object> empty = new HashMap<>();
        empty.put("users",    new ArrayList<>());
        empty.put("posts",    new ArrayList<>());
        empty.put("hashtags", new ArrayList<>());

        if (query == null || query.isBlank()) return empty;

        String q = query.trim().toLowerCase();

        List<User> users = userRepo.searchUsers(q, PageRequest.of(page, size));
        List<Post> posts = postRepo.searchPosts(q,  PageRequest.of(page, size));

        Map<String, Object> result = new HashMap<>();
        result.put("users",    users.stream().map(this::mapUser).toList());
        result.put("posts",    posts.stream().map(this::mapPost).toList());
        result.put("hashtags", buildHashtagSuggestions(q));
        return result;
    }

    // ─── Автодополнение ───────────────────────────────────────
    public List<String> autocomplete(String prefix) {
        if (prefix == null || prefix.length() < 2) return List.of();
        return userRepo.searchUsers(prefix, PageRequest.of(0, 5))
                .stream()
                .map(u -> "@" + u.getUsername())
                .toList();
    }

    public List<Map<String, Object>> trendingHashtags() {
        List<Object[]> rows = postRepo.findTrendingHashtags(PageRequest.of(0, 10));

        return rows.stream()
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("tag", r[0]);     // хэштег
                    m.put("count", r[1]);   // количество
                    return m;
                })
                .toList();
    }

    // ─── Helpers ──────────────────────────────────────────────
    private Map<String, Object> mapUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",         u.getId());
        m.put("username",   u.getUsername());
        m.put("fullName",   u.getFullName()  != null ? u.getFullName()  : "");
        m.put("avatarUrl",  u.getAvatarUrl() != null ? u.getAvatarUrl() : "");
        m.put("isVerified", u.getIsVerified());
        return m;
    }

    private Map<String, Object> mapPost(Post p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id",         p.getId());
        m.put("content",    p.getContent()  != null ? p.getContent()  : "");
        m.put("username",   p.getUser().getUsername());
        m.put("likesCount", p.getLikesCount());
        m.put("createdAt",  p.getCreatedAt().toString());
        return m;
    }

    private List<Map<String, Object>> buildHashtagSuggestions(String q) {
        Map<String, Object> tag = new HashMap<>();
        tag.put("name",       q);
        tag.put("postsCount", 0);
        return List.of(tag);
    }
}
