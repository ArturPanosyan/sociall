package com.socialnet.repository;
import com.socialnet.entity.Product;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByStatusOrderByCreatedAtDesc(Product.ProductStatus status, Pageable p);
    @Query("SELECT p FROM Product p WHERE p.status='ACTIVE' AND (LOWER(p.title) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.category) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<Product> search(@Param("q") String q, Pageable p);
    Page<Product> findByStatusAndCategoryOrderByCreatedAtDesc(Product.ProductStatus s, String cat, Pageable p);
    Page<Product> findBySellerUsernameAndStatusOrderByCreatedAtDesc(String username, Product.ProductStatus status, Pageable p);
}
