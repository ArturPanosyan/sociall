package com.socialnet.repository;


import com.socialnet.entity.Follow;
import com.socialnet.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    boolean existsByFollowerAndFollowing(User follower, User following);

    @Query("SELECT f.follower FROM Follow f WHERE f.following = :user AND f.status = 'ACCEPTED'")
    Page<User> findFollowers(@Param("user") User user, Pageable pageable);

    @Query("SELECT f.following FROM Follow f WHERE f.follower = :user AND f.status = 'ACCEPTED'")
    Page<User> findFollowing(@Param("user") User user, Pageable pageable);

    long countByFollowingAndStatus(User user, Follow.FollowStatus status);
    long countByFollowerAndStatus(User user, Follow.FollowStatus status);
}
