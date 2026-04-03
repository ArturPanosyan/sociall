package com.socialnet.repository;

import com.socialnet.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c JOIN ConversationMember cm ON cm.conversation = c WHERE cm.user.id = :userId ORDER BY c.createdAt DESC")
    List<Conversation> findByMember(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.type = 'DIRECT' AND " +
           "(SELECT COUNT(cm) FROM ConversationMember cm WHERE cm.conversation = c) = 2 AND " +
           "EXISTS (SELECT cm FROM ConversationMember cm WHERE cm.conversation = c AND cm.user.id = :u1) AND " +
           "EXISTS (SELECT cm FROM ConversationMember cm WHERE cm.conversation = c AND cm.user.id = :u2)")
    Optional<Conversation> findDirectBetween(@Param("u1") Long u1, @Param("u2") Long u2);
}
