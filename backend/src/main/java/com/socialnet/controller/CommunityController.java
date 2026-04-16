package com.socialnet.controller;
import com.socialnet.entity.Community;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/communities") @RequiredArgsConstructor
public class CommunityController {
    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> list(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(required=false) String q) {
        Pageable p = PageRequest.of(page, 20);
        return ResponseEntity.ok((q != null && !q.isBlank()
                ? communityRepo.search(q, p)
                : communityRepo.findAllByOrderByMembersCountDesc(p)).map(this::mapC));
    }
    @GetMapping("/{slug}")
    public ResponseEntity<Map<String,Object>> get(@PathVariable String slug) {
        return ResponseEntity.ok(mapC(communityRepo.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Community not found"))));
    }
    @PostMapping
    public ResponseEntity<Map<String,Object>> create(@RequestBody CreateReq req,
            @AuthenticationPrincipal UserDetails ud) {
        User owner = getUser(ud.getUsername());
        String slug = req.name().toLowerCase().replaceAll("[^a-z0-9]","-");
        if (communityRepo.findBySlug(slug).isPresent()) slug += "-" + (System.currentTimeMillis() % 10000);
        Community c = Community.builder().name(req.name()).slug(slug)
                .description(req.description())
                .type(req.isPrivate() ? Community.CommunityType.PRIVATE : Community.CommunityType.PUBLIC)
                .owner(owner).membersCount(1).build();
        c.getMembers().add(owner);
        return ResponseEntity.ok(mapC(communityRepo.save(c)));
    }
    @PostMapping("/{slug}/join")
    public ResponseEntity<Void> join(@PathVariable String slug, @AuthenticationPrincipal UserDetails ud) {
        Community c = communityRepo.findBySlug(slug).orElseThrow(() -> new NotFoundException("Not found"));
        User u = getUser(ud.getUsername());
        if (!c.getMembers().contains(u)) { c.getMembers().add(u); c.setMembersCount(c.getMembersCount()+1); communityRepo.save(c); }
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{slug}/leave")
    public ResponseEntity<Void> leave(@PathVariable String slug, @AuthenticationPrincipal UserDetails ud) {
        Community c = communityRepo.findBySlug(slug).orElseThrow(() -> new NotFoundException("Not found"));
        User u = getUser(ud.getUsername());
        if (c.getMembers().remove(u)) { c.setMembersCount(Math.max(0,c.getMembersCount()-1)); communityRepo.save(c); }
        return ResponseEntity.ok().build();
    }
    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }
    private Map<String,Object> mapC(Community c) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",c.getId()); m.put("name",c.getName()); m.put("slug",c.getSlug());
        m.put("description",c.getDescription()!=null?c.getDescription():"");
        m.put("avatarUrl",c.getAvatarUrl()!=null?c.getAvatarUrl():"");
        m.put("type",c.getType().name()); m.put("membersCount",c.getMembersCount());
        m.put("ownerUsername",c.getOwner()!=null?c.getOwner().getUsername():"");
        return m;
    }
    record CreateReq(String name, String description, boolean isPrivate) {}
}
