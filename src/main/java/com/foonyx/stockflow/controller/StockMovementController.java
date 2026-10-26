
package com.foonyx.stockflow.controller;

import com.foonyx.stockflow.dto.StockMovementRequest;
import com.foonyx.stockflow.entity.StockMovement;
import com.foonyx.stockflow.service.StockMovementService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(
            StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @PostMapping("/stock-in")
    public StockMovement stockIn(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request) {

        return stockMovementService.stockIn(
                productId, request.getQuantity());
    }

    @PostMapping("/stock-out")
    public StockMovement stockOut(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request) {

        return stockMovementService.stockOut(
                productId, request.getQuantity());
    }

    @GetMapping("/movements")
    public List<StockMovement> getMovements(
            @PathVariable Long productId) {

        return stockMovementService
                .getMovementsByProduct(productId);
    }
}
