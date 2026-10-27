
package com.foonyx.stockflow.controller;

import com.foonyx.stockflow.dto.StockMovementRequest;
import com.foonyx.stockflow.dto.StockMovementResponse;
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
    public StockMovementResponse stockIn(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request) {

        StockMovement movement = stockMovementService.stockIn(
                productId, request.getQuantity());

        return new StockMovementResponse(movement);
    }

    @PostMapping("/stock-out")
    public StockMovementResponse stockOut(
            @PathVariable Long productId,
            @Valid @RequestBody StockMovementRequest request) {

        StockMovement movement = stockMovementService.stockOut(
                productId, request.getQuantity());

        return new StockMovementResponse(movement);
    }

    @GetMapping("/movements")
    public List<StockMovementResponse> getMovements(
            @PathVariable Long productId) {

        return stockMovementService
                .getMovementsByProduct(productId)
                .stream()
                .map(StockMovementResponse::new)
                .toList();
    }

    @GetMapping("/movements/all")
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementService
                .getAllMovements()
                .stream()
                .map(StockMovementResponse::new)
                .toList();
    }

}
