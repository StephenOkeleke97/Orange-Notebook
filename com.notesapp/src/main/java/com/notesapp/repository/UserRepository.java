package com.notesapp.repository;

import org.springframework.data.repository.CrudRepository;

import com.notesapp.model.User;

public interface UserRepository extends CrudRepository<User, Long>{
	User findByEmail(String email);
}
