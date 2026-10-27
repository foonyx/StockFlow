
package com.foonyx.stockflow.repository;

import com.foonyx.stockflow.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);

    boolean existsByUsername(String username);

    List<Admin> findByStatusOrderByIdAsc(String status);
}
