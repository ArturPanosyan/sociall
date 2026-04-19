package com.socialnet.repository;
import com.socialnet.entity.MentorSession;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
@Repository
public interface MentorSessionRepository extends JpaRepository<MentorSession, Long> {
    Page<MentorSession> findByStatusOrderByScheduledAtAsc(MentorSession.SessionStatus s, Pageable p);
    Page<MentorSession> findByMentorUsernameOrderByCreatedAtDesc(String u, Pageable p);
    Page<MentorSession> findByMenteeUsernameOrderByCreatedAtDesc(String u, Pageable p);
    @Query("SELECT DISTINCT m.mentor FROM MentorSession m WHERE m.mentor.id IS NOT NULL")
    Page<com.socialnet.entity.User> findMentors(Pageable p);
}
