package com.socialnet.repository;
import com.socialnet.entity.Community;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findBySlug(String slug);
    @Query("SELECT c FROM Community c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Community> search(@Param("q") String q, Pageable p);
    Page<Community> findAllByOrderByMembersCountDesc(Pageable p);
    @Query("SELECT c FROM Community c JOIN c.members m WHERE m.id=:uid")
    Page<Community> findByMember(@Param("uid") Long uid, Pageable p);
}
