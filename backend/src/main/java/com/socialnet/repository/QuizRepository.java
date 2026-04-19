package com.socialnet.repository;
import com.socialnet.entity.Quiz;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Page<Quiz> findByStatusOrderByPlaysCountDesc(Quiz.QuizStatus status, Pageable p);
    Page<Quiz> findByCreatorUsernameOrderByCreatedAtDesc(String username, Pageable p);
}
