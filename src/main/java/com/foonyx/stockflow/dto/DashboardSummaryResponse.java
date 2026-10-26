
package com.foonyx.stockflow.dto;

public class DashboardSummaryResponse {

    private long totalProducts;
    private long lowStockProducts;
    private long totalUnitsInStock;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(
            long totalProducts,
            long lowStockProducts,
            long totalUnitsInStock) {
        this.totalProducts = totalProducts;
        this.lowStockProducts = lowStockProducts;
        this.totalUnitsInStock = totalUnitsInStock;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public long getLowStockProducts() {
        return lowStockProducts;
    }

    public long getTotalUnitsInStock() {
        return totalUnitsInStock;
    }
}
