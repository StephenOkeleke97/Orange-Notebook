package com.notesapp.model;

import java.util.Date;
import java.util.Random;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
public class User {
	private static int OTPEXPIRATION = 5;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long userId;
	@Column(unique = true)
	private String email;
	private String password;
	private boolean enabled;
	private int oneTimePassword;
	@Temporal(TemporalType.TIMESTAMP)
	private Date oneTimePasswordDateAdded;
	private boolean twoFactorAuthentication;
	private String lastBackUpDate;
	private String lastBackUpSize;
	
	public User() {
		
	}
	
	public User(String email, String password) {
		super();
		this.email = email;
		this.password = password;
		this.enabled = false;
		this.oneTimePassword = 0;
		this.oneTimePasswordDateAdded = null;
		this.twoFactorAuthentication = false;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public int getOneTimePassword() {
		return oneTimePassword;
	}

	public void setOneTimePassword() {
		Random rand = new Random();
		int OTP = rand.nextInt(9000) + 1000;
		this.oneTimePassword = OTP;
		this.oneTimePasswordDateAdded = new Date();
	}

	public Date getOneTimePasswordDateAdded() {
		return oneTimePasswordDateAdded;
	}
	
	public boolean checkValidVerificationCode() {
		if (oneTimePassword == 0) {
			return false;
		}
		
		Date d = new Date();
		long currentTime = d.getTime();
		long timeDiffInMinutes = (currentTime - oneTimePasswordDateAdded
				.getTime()) / 1000 / 60;
		if (timeDiffInMinutes > OTPEXPIRATION) {
			return false;
		} else {
			return true;
		}
	}
	
	public boolean getTwoFactorAuthentication() {
		return twoFactorAuthentication;
	}
	
	public void setTwoFactorAuthentication(boolean enabled) {
		twoFactorAuthentication = enabled; 
	}
	
	public String getLastBackUpDate() {
		return lastBackUpDate;
	}
	
	public void setLastBackUpDate(String date) {
		lastBackUpDate = date;
	}
	
	public String getLastBackUpSize() {
		return lastBackUpSize;
	}
	
	public void setLastBackUpSize(String size) {
		lastBackUpSize = size;
	}

}
