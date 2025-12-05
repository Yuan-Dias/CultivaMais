package br.com.cultiva.cultivamais.exception;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class GlobalExceptionHandler {

    // Intercepta erros do tipo "ResourceNotFoundException" (ID não encontrado)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<StandardError> entityNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(HttpStatus.NOT_FOUND.value()); // Retorna 404
        err.setError("Recurso não encontrado");
        err.setMessage(e.getMessage()); // A mensagem que você escreveu no Service
        err.setPath(request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(err);
    }

    // Intercepta qualquer outro erro genérico (ex: NullPointer, Banco fora do ar)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardError> database(Exception e, HttpServletRequest request) {
        StandardError err = new StandardError();
        err.setTimestamp(Instant.now());
        err.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value()); // Retorna 500
        err.setError("Erro interno do servidor");
        err.setMessage("Ocorreu um erro inesperado: " + e.getMessage());
        err.setPath(request.getRequestURI());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    }
}