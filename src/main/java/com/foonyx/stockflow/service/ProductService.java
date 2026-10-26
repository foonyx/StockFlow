
package com.foonyx.stockflow.service;

import com.foonyx.stockflow.dto.ProductRequest;
import com.foonyx.stockflow.entity.Product;
import com.foonyx.stockflow.exception.ProductNotFoundException;
import com.foonyx.stockflow.repository.ProductRepository;
import com.foonyx.stockflow.repository.StockMovementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public ProductService(
            ProductRepository productRepository,
            StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with id: " + id));
    }

    @Transactional
    public Product createProduct(ProductRequest request) {
        Product product = new Product();
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setLowStockThreshold(request.getLowStockThreshold());
        product.setQuantity(0);

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest request) {
        Product product = getProductById(id);
        product.setSku(request.getSku());
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setLowStockThreshold(request.getLowStockThreshold());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);

        if (product.getQuantity() > 0) {
            throw new IllegalStateException(
                    "Cannot delete a product that still has stock.");
        }

        if (stockMovementRepository.existsByProductId(id)) {
            throw new IllegalStateException(
                    "Cannot delete a product with stock movement history.");
        }

        productRepository.delete(product);
    }
}
