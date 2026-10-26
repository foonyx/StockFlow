
package com.foonyx.stockflow.repository;

import com.foonyx.stockflow.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p")
    Long getTotalUnitsInStock();

    @Query("""
            SELECT p FROM Product p
            WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    List<Product> searchProducts(@Param("search") String search);
}
