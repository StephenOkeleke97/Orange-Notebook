package com.notesapp.controller;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import com.notesapp.model.Note;
import com.notesapp.model.User;
import com.notesapp.repository.NoteRepository;
import com.notesapp.repository.UserRepository;
import com.notesapp.storage.StorageFileNotFoundException;
import com.notesapp.storage.StorageService;

@CrossOrigin(origins = "http://10.0.0.47:19000")
@RestController
@RequestMapping("api/")
public class Controller {
	
	private final StorageService storageService;
		
	@Autowired
	private SMTPMailSender mailSender;

	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private NoteRepository noteRepository;
	
	@Autowired
	public Controller(StorageService storageService) {
		this.storageService = storageService;
	}
	
	@GetMapping("files")
	public List<String> listUploadedFiles(Model model) throws IOException {
		return storageService.loadAll().map(p -> p.toString()).collect(Collectors.toList());
	}
	
	@GetMapping("/files/{filename}")
	@ResponseBody
	public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
		Resource file = storageService.loadAsResource(filename);
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" +
		file.getFilename() + "\"").body(file);
	}
	
	@PostMapping("backup")
	public String handleFileUpload(@RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) {
		storageService.store(file);
		redirectAttributes.addFlashAttribute("message", "You succesfully uploaded" + 
		file.getOriginalFilename() + "!");
		return "redirect:/";
	}
	
	@DeleteMapping("deleteBackup/{filename}")
	public String deleteBackup(@PathVariable String filename, 
			@RequestParam String userEmail) {
		storageService.delete(filename);
		User n = userRepository.findByEmail(userEmail);
		n.setLastBackUpDate(null);
		n.setLastBackUpSize(null);
		userRepository.save(n);
		return "deleted";
	}
	
	@ExceptionHandler(StorageFileNotFoundException.class)
	public ResponseEntity<?> handleStorageFileNotFound(StorageFileNotFoundException exc) {
		return ResponseEntity.notFound().build();
	}
	
	@GetMapping("verifyEmail")
	public boolean checkIfEmailExists(@RequestParam String userEmail) {
		User n = userRepository.findByEmail(userEmail);
		if (n == null) return true;
		if (n != null && !n.isEnabled()) {
			userRepository.delete(n);
			return true;
		}
		return false;
	}
	
	@PostMapping("addUser")
	public @ResponseBody String addNewUser(@RequestParam String email, 
			@RequestParam String password) {
		User n = new User();
		n.setEmail(email);
		n.setPassword(password);
		n.setEnabled(false);
		userRepository.save(n);			
		sendVerificationMail(email);
		return "Success";
	}
	
	@GetMapping("resendVerification")
	public @ResponseBody String sendVerificationMail(@RequestParam String email) {
		User user = userRepository.findByEmail(email);
		user.setOneTimePassword();
		userRepository.save(user);
		int OTP = user.getOneTimePassword();
		String body = String.format("Your One Time Verification Code is : %s.\n"
				+ "This code will expire after 5 minutes.", OTP);
		try {
			mailSender.send(email, "Verification Code", body);
		} catch (MessagingException e) {
			e.printStackTrace();
			return "Failed to Send";
		}
		return "Success";
	}
	
	@GetMapping("login")
	public @ResponseBody boolean verifyUser(@RequestParam String email, 
			@RequestParam String password) {
		User n = userRepository.findByEmail(email);
		if (n == null || !n.isEnabled()) return false;
				
		if (n.getPassword().equals(password)) {
			if (n.getTwoFactorAuthentication()) sendVerificationMail(email);
			return true;
		}	
		return false;
	}
	
	@GetMapping("verifyOTP")
	public @ResponseBody boolean verify(@RequestParam String email, @RequestParam int verificationCode) {
		User n = userRepository.findByEmail(email);
		if (!n.checkValidVerificationCode()) {
			return false;
		}
		
		if (n.getOneTimePassword() == verificationCode) {
			if (!n.isEnabled()) {
				n.setEnabled(true);
				userRepository.save(n);
			}	
			return true;
		}
		return false;		
	}
	
	@GetMapping("getUsers")
	public @ResponseBody Iterable<User> getAllUsers(){
		return userRepository.findAll();
	}
	
	@DeleteMapping("deleteAccount")
	public @ResponseBody String deleteUser(@RequestParam String userEmail) {
		User n = userRepository.findByEmail(userEmail);
		userRepository.delete(n);
		return "Success";	
	}
	
	@PostMapping("addNote")
	public @ResponseBody String addNewNote(@RequestParam String userEmail, 
			@RequestParam String category, @RequestParam String content, 
			@RequestParam String label) {
		User u = userRepository.findByEmail(userEmail);
		Note n = new Note();
		n.setUser(u);
		n.setCategory(category);
		n.setContent(content);
		n.setLabel(label);
		n.setDate(new Date());
		noteRepository.save(n);
		return "Saved";
	}
	
	@GetMapping("getNotes")
	public @ResponseBody Iterable<Note> getUserNotes(@RequestParam String userEmail) {
		User u = userRepository.findByEmail(userEmail);
		return noteRepository.findByUser(u);
	}
	
	@GetMapping("getTwoFactor")
	public boolean twoFactorEnabled(@RequestParam String userEmail) {
		User u = userRepository.findByEmail(userEmail);
		return u.getTwoFactorAuthentication();
	}
	
	@PostMapping("enableTwoFactor")
	public String enableTwoFactor(@RequestParam String userEmail, @RequestParam boolean enabled) {
		User u = userRepository.findByEmail(userEmail);
		u.setTwoFactorAuthentication(enabled);
		userRepository.save(u);
		return "Success";
	}
	
	@PutMapping("resetPassword")
	public @ResponseBody String resetPassword(@RequestParam String email, 
			@RequestParam String password) {
		User n = userRepository.findByEmail(email);
		if (n == null) return "Failed";
		
		n.setPassword(password);
		userRepository.save(n);
		return "Success";
	}
	
	@GetMapping("lastBackUp")
	public String[] getLastBackUpDateAndSize(@RequestParam String userEmail) {
		User n = userRepository.findByEmail(userEmail);
		return new String[] {n.getLastBackUpDate(), n.getLastBackUpSize()};
	}
	
	@PutMapping("updateLastBackUp")
	public String setLastBackUpDate(@RequestParam String userEmail, 
			@RequestParam String date, @RequestParam String size) {
		User n = userRepository.findByEmail(userEmail);
		n.setLastBackUpDate(date);
		n.setLastBackUpSize(size);
		userRepository.save(n);
		return "Success";
	}
}
