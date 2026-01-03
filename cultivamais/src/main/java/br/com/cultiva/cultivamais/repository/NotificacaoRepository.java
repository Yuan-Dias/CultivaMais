package br.com.cultiva.cultivamais.repository;

import br.com.cultiva.cultivamais.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    // Busca as notificações do usuário ordenadas pela data (mais nova primeiro)
    List<Notificacao> findByUsuario_IdUsuarioOrderByDataHoraDesc(Long idUsuario);

    // Útil para mostrar o "balãozinho" vermelho de notificações não lidas no front
    long countByUsuario_IdUsuarioAndLidaFalse(Long idUsuario);
}