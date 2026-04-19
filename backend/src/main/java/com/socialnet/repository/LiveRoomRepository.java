package com.socialnet.repository;
import com.socialnet.entity.LiveRoom;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface LiveRoomRepository extends JpaRepository<LiveRoom, Long> {
    Page<LiveRoom> findByStatusOrderByListenersCountDesc(LiveRoom.RoomStatus status, Pageable p);
    Optional<LiveRoom> findByRoomKey(String key);
}
