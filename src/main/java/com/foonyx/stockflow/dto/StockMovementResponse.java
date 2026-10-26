
package com.foonyx.stockflow.dto;

import com.foonyx.stockflow.entity.StockMovement;

import java.time.LocalDateTime;

public class StockMovementResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String type;
    private Integer quantity;
    private LocalDateTime createdAt;

    public StockMovementResponse() {
    }

    public StockMovementResponse(StockMovement movement) {
        this.id = movement.getId();
        this.productId = movement.getProduct().getId();
        this.productName = movement.getProduct().getName();
        this.type = movement.getType();
        this.quantity = movement.getQuantity();
        this.createdAt = movement.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public String getType() {
        return type;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
