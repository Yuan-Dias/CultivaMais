package br.com.cultiva.cultivamais.controller;

import br.com.cultiva.cultivamais.model.LogSistema;
import br.com.cultiva.cultivamais.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping
    public ResponseEntity<?> listarLogs() {
        try {
            List<LogSistema> logsDoBanco = logService.listarTodos();

            // CONVERSÃO MANUAL (Evita erro de serialização de Data)
            List<Map<String, Object>> listaSegura = new ArrayList<>();

            for (LogSistema log : logsDoBanco) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", log.getId());
                item.put("usuario", log.getUsuario());
                item.put("acao", log.getAcao());

                // Converte a data para String aqui mesmo
                if (log.getDataHora() != null) {
                    item.put("dataHora", log.getDataHora().toString());
                } else {
                    item.put("dataHora", "");
                }

                listaSegura.add(item);
            }

            return ResponseEntity.ok(listaSegura);

        } catch (Exception e) {
            // SE DEU ERRO, VAI IMPRIMIR NO CONSOLE DO JAVA
            System.err.println("❌ ERRO CRÍTICO NO LOG CONTROLLER:");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro interno: " + e.getMessage());
        }
    }
}