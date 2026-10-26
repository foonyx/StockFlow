
package com.foonyx.stockflow.repository;

import com.foonyx.stockflow.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(
            Long productId);

    boolean existsByProductId(Long productId);
}
