package br.com.cultiva.cultivamais.service;

import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogService {

    @Autowired
    private LogRepository logRepository;

    // Método seguro para registrar logs sem parar o sistema se der erro
    public void registrarLog(String usuario, String acao) {
        try {
            LogSistema log = new LogSistema(usuario, acao);
            logRepository.save(log);
        } catch (Exception e) {
            System.err.println("Falha ao salvar log: " + e.getMessage());
        }
    }

    public List<LogSistema> listarTodos() {
        return logRepository.findAllByOrderByDataHoraDesc();
    }
}