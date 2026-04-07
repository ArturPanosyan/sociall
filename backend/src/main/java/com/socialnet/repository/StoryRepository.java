package com.socialnet.repository;

import com.socialnet.entity.Story;
import com.socialnet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    // Stories подписок (ещё живые)
    @Query("""
        SELECT s FROM Story s
        WHERE s.expiresAt > :now
          AND s.user.id IN (
            SELECT f.following.id FROM Follow f
            WHERE f.follower.id = :userId AND f.status = 'ACCEPTED'
          )
        ORDER BY s.createdAt DESC
        """)
    List<Story> findFeedStories(@Param("userId") Long userId,
                                @Param("now") LocalDateTime now);

    // Stories конкретного пользователя
    List<Story> findByUserAndExpiresAtAfterOrderByCreatedAtDesc(User user, LocalDateTime now);

    // Авто-удаление просроченных (Scheduled job)
    @Modifying
    @Query("DELETE FROM Story s WHERE s.expiresAt <= :now")
    int deleteExpired(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Story s SET s.viewsCount = s.viewsCount + 1 WHERE s.id = :id")
    void incrementViews(@Param("id") Long id);
}
