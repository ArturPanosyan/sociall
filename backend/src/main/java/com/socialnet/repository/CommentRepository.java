package com.socialnet.repository;

import com.socialnet.entity.Comment;
import com.socialnet.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Топ-уровень комментарии поста (без replies)
    @Query("""
        SELECT c FROM Comment c
        WHERE c.post = :post
          AND c.parent IS NULL
          AND c.isDeleted = false
        ORDER BY c.createdAt ASC
        """)
    Page<Comment> findTopLevelByPost(@Param("post") Post post, Pageable pageable);

    // Replies к комментарию
    @Query("""
        SELECT c FROM Comment c
        WHERE c.parent.id = :parentId
          AND c.isDeleted = false
        ORDER BY c.createdAt ASC
        """)
    List<Comment> findReplies(@Param("parentId") Long parentId);

    long countByPostAndIsDeletedFalse(Post post);

    @Modifying
    @Query("UPDATE Comment c SET c.likesCount = c.likesCount + 1 WHERE c.id = :id")
    void incrementLikes(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Comment c SET c.likesCount = c.likesCount - 1 WHERE c.id = :id AND c.likesCount > 0")
    void decrementLikes(@Param("id") Long id);
}
