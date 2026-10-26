
package com.foonyx.stockflow.repository;

import com.foonyx.stockflow.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p WHERE p.quantity <= p.lowStockThreshold")
    List<Product> findLowStockProducts();

    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Product p")
    Long getTotalUnitsInStock();
}
