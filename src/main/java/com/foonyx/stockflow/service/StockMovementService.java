
package com.foonyx.stockflow.service;

import com.foonyx.stockflow.entity.Admin;
import com.foonyx.stockflow.entity.Product;
import com.foonyx.stockflow.entity.StockMovement;
import com.foonyx.stockflow.exception.ProductNotFoundException;
import com.foonyx.stockflow.repository.AdminRepository;
import com.foonyx.stockflow.repository.ProductRepository;
import com.foonyx.stockflow.repository.StockMovementRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockMovementService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AdminRepository adminRepository;

    public StockMovementService(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository,
            AdminRepository adminRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.adminRepository = adminRepository;
    }

    @Transactional
    public StockMovement stockIn(Long productId, int quantity) {
        validateQuantity(quantity);

        Admin admin = getCurrentAdmin();
        Product product = findProduct(productId);

        product.setQuantity(product.getQuantity() + quantity);
        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setAdmin(admin);
        movement.setType("STOCK_IN");
        movement.setQuantity(quantity);

        return stockMovementRepository.save(movement);
    }

    @Transactional
    public StockMovement stockOut(Long productId, int quantity) {
        validateQuantity(quantity);

        Admin admin = getCurrentAdmin();
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
        movement.setAdmin(admin);
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

    @Transactional(readOnly = true)
    public List<StockMovement> getAllMovements() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc();
    }

    private Admin getCurrentAdmin() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {
            throw new IllegalStateException(
                    "An authenticated admin is required.");
        }

        return adminRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated admin account was not found."));
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
