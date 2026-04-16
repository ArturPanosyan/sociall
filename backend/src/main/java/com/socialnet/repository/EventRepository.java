package com.socialnet.repository;
import com.socialnet.entity.Event;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    Page<Event> findByStartAtAfterOrderByStartAtAsc(LocalDateTime now, Pageable p);
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE LOWER(CONCAT('%',:q,'%'))")
    Page<Event> search(@Param("q") String q, Pageable p);
}
