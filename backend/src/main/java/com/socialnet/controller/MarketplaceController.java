package com.socialnet.controller;
import com.socialnet.entity.Product;
import com.socialnet.entity.User;
import com.socialnet.exception.NotFoundException;
import com.socialnet.repository.*;
import com.socialnet.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.*;

@RestController @RequestMapping("/api/marketplace") @RequiredArgsConstructor
public class MarketplaceController {
    private final ProductRepository productRepo;
    private final UserRepository    userRepo;
    private final FileStorageService fileStorage;

    @GetMapping
    public ResponseEntity<Page<Map<String,Object>>> list(
            @RequestParam(defaultValue="0") int page,
            @RequestParam(required=false) String q,
            @RequestParam(required=false) String category) {
        Pageable p = PageRequest.of(page, 20);
        Page<Product> products;
        if (q != null && !q.isBlank()) products = productRepo.search(q, p);
        else if (category != null && !category.isBlank())
            products = productRepo.findByStatusAndCategoryOrderByCreatedAtDesc(Product.ProductStatus.ACTIVE, category, p);
        else products = productRepo.findByStatusOrderByCreatedAtDesc(Product.ProductStatus.ACTIVE, p);
        return ResponseEntity.ok(products.map(this::map));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String,Object>> get(@PathVariable Long id) {
        Product p = productRepo.findById(id).orElseThrow(() -> new NotFoundException("Product not found"));
        productRepo.save(p); // increment view
        return ResponseEntity.ok(map(p));
    }

    @PostMapping(consumes="multipart/form-data")
    public ResponseEntity<Map<String,Object>> create(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam BigDecimal price,
            @RequestParam(required=false) String category,
            @RequestParam(required=false) String location,
            @RequestParam(required=false) MultipartFile image,
            @AuthenticationPrincipal UserDetails ud) {
        User seller = getUser(ud.getUsername());
        String imageUrl = image != null ? fileStorage.uploadPostMedia(image) : null;
        Product p = Product.builder()
                .seller(seller).title(title).description(description)
                .price(price).category(category).location(location).imageUrl(imageUrl).build();
        return ResponseEntity.ok(map(productRepo.save(p)));
    }

    @PatchMapping("/{id}/sold")
    public ResponseEntity<Void> markSold(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        Product p = productRepo.findById(id).orElseThrow(() -> new NotFoundException("Not found"));
        if (p.getSeller().getUsername().equals(ud.getUsername())) {
            p.setStatus(Product.ProductStatus.SOLD);
            productRepo.save(p);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserDetails ud) {
        Product p = productRepo.findById(id).orElseThrow(() -> new NotFoundException("Not found"));
        if (p.getSeller().getUsername().equals(ud.getUsername())) {
            p.setStatus(Product.ProductStatus.DELETED);
            productRepo.save(p);
        }
        return ResponseEntity.ok().build();
    }

    private User getUser(String u) { return userRepo.findByUsername(u).orElseThrow(() -> new NotFoundException("User not found")); }

    private Map<String,Object> map(Product p) {
        Map<String,Object> m = new HashMap<>();
        m.put("id",p.getId()); m.put("title",p.getTitle());
        m.put("description",p.getDescription()!=null?p.getDescription():"");
        m.put("price",p.getPrice()); m.put("imageUrl",p.getImageUrl()!=null?p.getImageUrl():"");
        m.put("category",p.getCategory()!=null?p.getCategory():"Other");
        m.put("location",p.getLocation()!=null?p.getLocation():"");
        m.put("status",p.getStatus().name()); m.put("viewsCount",p.getViewsCount());
        m.put("sellerUsername",p.getSeller().getUsername());
        m.put("sellerFullName",p.getSeller().getFullName()!=null?p.getSeller().getFullName():p.getSeller().getUsername());
        m.put("sellerAvatar",p.getSeller().getAvatarUrl()!=null?p.getSeller().getAvatarUrl():"");
        m.put("createdAt",p.getCreatedAt().toString());
        return m;
    }
}
