package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"akademia-backend/internal/config"
	"akademia-backend/internal/handlers"

	"github.com/joho/godotenv"
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next(w, r)
	}
}

func main() {
	godotenv.Load()
	config.ConnectDB()

	// Public registration is disabled because accounts are managed by the organization.
	// http.HandleFunc("/api/register", enableCORS(handlers.Register))

	// Active authentication and management routes
	http.HandleFunc("/api/login", enableCORS(handlers.Login))
	http.HandleFunc("/api/change-password", enableCORS(handlers.ChangePassword))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	fmt.Printf("Server running on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}