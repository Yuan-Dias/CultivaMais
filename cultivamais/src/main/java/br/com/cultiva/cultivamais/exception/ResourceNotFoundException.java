package br.com.cultiva.cultivamais.exception;

// Esta classe representa o erro "Não Encontrado" personalizado
public class ResourceNotFoundException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public ResourceNotFoundException(String mensagem) {
        super(mensagem);
    }
}