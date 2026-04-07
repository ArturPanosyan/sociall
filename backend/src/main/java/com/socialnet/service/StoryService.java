package com.socialnet.service;

import com.socialnet.entity.Story;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.StoryRepository;
import com.socialnet.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoryService {

    private final StoryRepository    storyRepo;
    private final UserRepository     userRepo;
    private final FileStorageService fileStorage;

    // ─── Создать story ────────────────────────────────────────
    @Transactional
    public Story createStory(MultipartFile file, String username) {
        User user = getUser(username);
        String key  = fileStorage.uploadPostMedia(file);
        boolean isVideo = file.getContentType() != null
                && file.getContentType().startsWith("video/");

        Story story = Story.builder()
                .user(user)
                .mediaUrl("/api/files/" + key)
                .type(isVideo ? Story.StoryType.VIDEO : Story.StoryType.IMAGE)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        return storyRepo.save(story);
    }

    // ─── Лента stories (сгруппировано по пользователям) ──────
    @Transactional(readOnly = true)
    public Map<String, List<Story>> getFeedStories(String username) {
        User user = getUser(username);
        List<Story> all = storyRepo.findFeedStories(user.getId(), LocalDateTime.now());

        // Группировать по username автора
        return all.stream().collect(
            Collectors.groupingBy(s -> s.getUser().getUsername())
        );
    }

    // ─── Stories пользователя ─────────────────────────────────
    @Transactional(readOnly = true)
    public List<Story> getUserStories(String username) {
        User user = getUser(username);
        return storyRepo.findByUserAndExpiresAtAfterOrderByCreatedAtDesc(
                user, LocalDateTime.now());
    }

    // ─── Просмотр ─────────────────────────────────────────────
    @Transactional
    public void view(Long storyId) {
        if (!storyRepo.existsById(storyId)) throw new NotFoundException("Story not found");
        storyRepo.incrementViews(storyId);
    }

    // ─── Авто-удаление каждый час ─────────────────────────────
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanExpired() {
        int deleted = storyRepo.deleteExpired(LocalDateTime.now());
        if (deleted > 0) log.info("Deleted {} expired stories", deleted);
    }

    private User getUser(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
