package br.com.cultiva.cultivamais.exception;

import java.time.Instant;

// DTO simples para padronizar a resposta de erro
public class StandardError {
    private Instant timestamp;
    private Integer status;
    private String error;
    private String message;
    private String path;

    public StandardError() {}

    public StandardError(Instant timestamp, Integer status, String error, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Getters
    public Instant getTimestamp() { 
        return timestamp; 
    }
    public Integer getStatus() { 
        return status; 
    }
    public String getError() { 
        return error; 
    }
    public String getMessage() { 
        return message; 
    }
    public String getPath() { 
        return path; 
    }

    //Setters
    public void setTimestamp(Instant timestamp) { 
        this.timestamp = timestamp; 
    }
    public void setStatus(Integer status) { 
        this.status = status; 
    }
    public void setError(String error) { 
        this.error = error; 
    }
    public void setMessage(String message) { 
        this.message = message; 
    }
    public void setPath(String path) { 
        this.path = path; 
    }
}