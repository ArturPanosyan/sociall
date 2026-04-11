package com.socialnet.repository;

import com.socialnet.dto.HashtagTrendDto;
import com.socialnet.entity.Post;
import com.socialnet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

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
        SELECT h, COUNT(h) as cnt
        FROM Post p
        JOIN p.hashtags h
        GROUP BY h
        ORDER BY cnt DESC
    """)
    List<Object[]> findTrendingHashtags(Pageable pageable);

    @Query("""
    SELECT p FROM Post p
    WHERE LOWER(p.content) LIKE LOWER(CONCAT('%#', :tag, '%'))
""")
    Page<Post> findByHashtag(@Param("tag") String tag, Pageable pageable);

    // Счётчики
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

    long countByIsDeletedTrue();

    long countByUserAndIsDeletedFalse(User user);


    @Query("""
        SELECT p FROM Post p
        WHERE LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<Post> searchPosts(@Param("query") String query, Pageable pageable);


}
