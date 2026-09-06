package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"time"

	"akademia-backend/internal/config"
	"akademia-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Login handles authenticating pre-provisioned organizational users
func Login(w http.ResponseWriter, r *http.Request) {
	var input models.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": err.Error()})
		return
	}

	var user models.User
	query := `SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`
	err := config.DB.QueryRow(query, input.Email).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt,
	)

	if err == sql.ErrNoRows || bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)) != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Invalid email or password"})
		return
	} else if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Database error"})
		return
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-key"
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(jwtSecret))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user": map[string]interface{}{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// ChangePassword allows logged-in users to update their password securely
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"message": "Method not allowed"})
		return
	}

	var input struct {
		Email       string `json:"email"`
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"message": "Invalid request payload"})
		return
	}

	var storedHash string
	err := config.DB.QueryRow("SELECT password_hash FROM users WHERE email = $1", input.Email).Scan(&storedHash)
	if err == sql.ErrNoRows {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"message": "User not found"})
		return
	} else if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Database error"})
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(input.OldPassword)) != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"message": "Incorrect current password"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Failed to hash new password"})
		return
	}

	_, err = config.DB.Exec("UPDATE users SET password_hash = $1 WHERE email = $2", string(hashedPassword), input.Email)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"message": "Database error updating password"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password changed successfully",
	})
}