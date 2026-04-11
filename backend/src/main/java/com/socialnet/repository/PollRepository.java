package com.socialnet.repository;
import com.socialnet.entity.Poll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface PollRepository extends JpaRepository<Poll, Long> {
    Optional<Poll> findByPostId(Long postId);
}
