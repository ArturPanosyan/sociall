package com.socialnet.repository;

import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Лента: посты от пользователей на которых подписан + свои
    @Query("""
        SELECT p FROM Post p
        WHERE p.isDeleted = false
          AND p.visibility = 'PUBLIC'
          AND (
            p.user.id IN (
              SELECT f.following.id FROM Follow f
              WHERE f.follower.id = :userId AND f.status = 'ACCEPTED'
            )
            OR p.user.id = :userId
          )
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findFeedPosts(@Param("userId") Long userId, Pageable pageable);

    // Посты пользователя
    Page<Post> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(User user, Pageable pageable);

    // По хэштегу
    @Query("""
        SELECT p FROM Post p
        JOIN p.hashtags h
        WHERE h.name = :tag AND p.isDeleted = false
        ORDER BY p.createdAt DESC
        """)
    Page<Post> findByHashtag(@Param("tag") String tag, Pageable pageable);

    // Счётчики
    // ─── Поиск по тексту ──────────────────────────────────────
    @Query("""
        SELECT p FROM Post p
        WHERE p.isDeleted = false AND p.visibility = 'PUBLIC'
          AND LOWER(p.content) LIKE LOWER(CONCAT('%',:q,'%'))
        ORDER BY p.createdAt DESC
        """)
    java.util.List<Post> searchPosts(@Param("q") String q, Pageable pageable);

    // ─── Trending хэштеги ─────────────────────────────────────
    @Query(value = """
        SELECT h.name as name, COUNT(ph.post_id) as postsCount
        FROM hashtags h JOIN post_hashtags ph ON ph.hashtag_id = h.id
        JOIN posts p ON p.id = ph.post_id
        WHERE p.is_deleted = 0 AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY h.id, h.name ORDER BY postsCount DESC
        """, nativeQuery = true)
    java.util.List<java.util.Map<String, Object>> findTrendingHashtags(Pageable pageable);

    long countByIsDeletedTrue();
    long countByUserAndIsDeletedFalse(com.socialnet.entity.User user);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount + 1 WHERE p.id = :id")
    void incrementLikes(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.likesCount = p.likesCount - 1 WHERE p.id = :id AND p.likesCount > 0")
    void decrementLikes(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.commentsCount = p.commentsCount + 1 WHERE p.id = :id")
    void incrementComments(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Post p SET p.viewsCount = p.viewsCount + 1 WHERE p.id = :id")
    void incrementViews(@Param("id") Long id);

    Page<Post> findByTypeAndIsDeletedFalseOrderByCreatedAtDesc(Post.PostType type, Pageable p);

    Page<Post> findByIsDeletedFalseOrderByLikesCountDesc(Pageable p);
}