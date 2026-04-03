package com.socialnet.repository;

import com.socialnet.entity.ConversationMember;
import com.socialnet.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationMemberRepository extends JpaRepository<ConversationMember, Long> {
    boolean existsByConversationIdAndUserId(Long convId, Long userId);

    @Query("SELECT cm.user FROM ConversationMember cm WHERE cm.conversation.id = :convId AND cm.user.id <> :userId")
    Optional<User> findOtherMember(@Param("convId") Long convId, @Param("userId") Long userId);
}
