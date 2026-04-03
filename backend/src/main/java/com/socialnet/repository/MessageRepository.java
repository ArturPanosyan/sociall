package com.socialnet.repository;

import com.socialnet.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByConversationIdOrderByCreatedAtDesc(Long convId, Pageable pageable);

    default Page<Message> findByConversationId(Long convId, Pageable pageable) {
        return findByConversationIdOrderByCreatedAtDesc(convId, pageable);
    }

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :convId ORDER BY m.createdAt DESC LIMIT 1")
    Optional<Message> findLastMessage(@Param("convId") Long convId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :convId AND m.sender.id <> :userId AND m.isRead = false")
    long countUnread(@Param("convId") Long convId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :convId AND m.sender.id <> :userId")
    void markReadInConversation(@Param("convId") Long convId, @Param("userId") Long userId);
}
