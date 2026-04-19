package com.socialnet.repository;
import com.socialnet.entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserUsernameOrderByEarnedAtDesc(String username);
    boolean existsByUserUsernameAndType(String username, String type);
}
