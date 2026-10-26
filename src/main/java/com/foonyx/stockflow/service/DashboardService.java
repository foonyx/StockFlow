
package com.foonyx.stockflow.service;

import com.foonyx.stockflow.dto.DashboardSummaryResponse;
import com.foonyx.stockflow.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final ProductRepository productRepository;

    public DashboardService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public DashboardSummaryResponse getSummary() {
        long totalProducts = productRepository.count();

        long lowStockProducts =
                productRepository.findLowStockProducts().size();

        long totalUnitsInStock =
                productRepository.getTotalUnitsInStock();

        return new DashboardSummaryResponse(
                totalProducts,
                lowStockProducts,
                totalUnitsInStock
        );
    }
}
