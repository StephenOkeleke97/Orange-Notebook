package com.notesapp.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;

import com.notesapp.model.Note;
import com.notesapp.model.User;

public interface NoteRepository extends CrudRepository<Note, Long> {
	List<Note> findByUser(User user);
}
