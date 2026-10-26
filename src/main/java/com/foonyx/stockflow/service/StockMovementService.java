
package com.foonyx.stockflow.service;

import com.foonyx.stockflow.entity.Product;
import com.foonyx.stockflow.entity.StockMovement;
import com.foonyx.stockflow.exception.ProductNotFoundException;
import com.foonyx.stockflow.repository.ProductRepository;
import com.foonyx.stockflow.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockMovementService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockMovementService(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Transactional
    public StockMovement stockIn(Long productId, int quantity) {
        validateQuantity(quantity);

        Product product = findProduct(productId);

        product.setQuantity(product.getQuantity() + quantity);
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType("STOCK_IN");
        movement.setQuantity(quantity);

        return stockMovementRepository.save(movement);
    }

    @Transactional
    public StockMovement stockOut(Long productId, int quantity) {
        validateQuantity(quantity);

        Product product = findProduct(productId);

        if (product.getQuantity() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available quantity: "
                            + product.getQuantity());
        }

        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType("STOCK_OUT");
        movement.setQuantity(quantity);

        return stockMovementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByProduct(Long productId) {
        findProduct(productId);

        return stockMovementRepository
                .findByProductIdOrderByCreatedAtDesc(productId);
    }

    private Product findProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + productId));
    }

    private void validateQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero.");
        }
    }
}
