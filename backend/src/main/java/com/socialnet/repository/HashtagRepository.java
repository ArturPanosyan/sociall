package com.socialnet.repository;
import com.socialnet.entity.Hashtag;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByName(String name);
    Page<Hashtag> findAllByOrderByPostsCountDesc(Pageable p);
}
