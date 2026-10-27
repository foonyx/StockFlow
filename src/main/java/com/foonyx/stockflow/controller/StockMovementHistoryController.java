
package com.foonyx.stockflow.controller;

import com.foonyx.stockflow.dto.StockMovementResponse;
import com.foonyx.stockflow.service.StockMovementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementHistoryController {

    private final StockMovementService stockMovementService;

    public StockMovementHistoryController(
            StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public List<StockMovementResponse> getAllMovements() {
        return stockMovementService
                .getAllMovements()
                .stream()
                .map(StockMovementResponse::new)
                .toList();
    }
}
