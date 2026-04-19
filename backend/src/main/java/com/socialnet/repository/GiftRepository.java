package com.socialnet.repository;
import com.socialnet.entity.Gift;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface GiftRepository extends JpaRepository<Gift, Long> {
    Page<Gift> findByReceiverUsernameOrderByCreatedAtDesc(String username, Pageable p);
    @Query("SELECT SUM(g.coins) FROM Gift g WHERE g.receiver.username = :u")
    Long sumCoinsByReceiver(@Param("u") String username);
}
