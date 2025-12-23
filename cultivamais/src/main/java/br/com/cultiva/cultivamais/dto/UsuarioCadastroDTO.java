package br.com.cultiva.cultivamais.dto;

import br.com.cultiva.cultivamais.model.FuncaoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioCadastroDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String nomeUsuario;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    // Regex: Pelo menos 1 maiúscula, 1 minúscula, 1 número e 1 especial
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$",
            message = "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais")
    private String senha;

    private FuncaoUsuario funcao;

    // Getters e Setters
    public String getNomeUsuario() { return nomeUsuario; }
    public void setNomeUsuario(String nomeUsuario) { this.nomeUsuario = nomeUsuario; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public FuncaoUsuario getFuncao() { return funcao; }
    public void setFuncao(FuncaoUsuario funcao) { this.funcao = funcao; }
}