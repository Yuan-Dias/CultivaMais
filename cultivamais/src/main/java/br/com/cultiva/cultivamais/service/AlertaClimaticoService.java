package br.com.cultiva.cultivamais.service;

import br.com.cultiva.cultivamais.model.AreaCultivo;
import br.com.cultiva.cultivamais.model.FuncaoUsuario;
import br.com.cultiva.cultivamais.model.Usuario;
import br.com.cultiva.cultivamais.repository.AreaCultivoRepository;
import br.com.cultiva.cultivamais.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AlertaClimaticoService {

    @Autowired
    private AreaCultivoRepository areaCultivoRepository;

    @Autowired
    private GeolocalizacaoService geolocalizacaoService;

    @Autowired
    private NotificacaoService notificacaoService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Executa todos os dias às 07:00 da manhã
    // Cron: Segundos Minutos Horas Dia Mes DiaSemana
    @Scheduled(cron = "0 0 7 * * *")
    public void verificarCondicoesClimaticas() {
        System.out.println(">>> Iniciando verificação climática automática...");

        List<AreaCultivo> areas = areaCultivoRepository.findAll();

        // Pega um administrador para receber alertas gerais (caso a área não tenha dono específico no seu modelo atual)
        // Se a AreaCultivo tiver um dono vinculado, melhor usar o dono.
        // Vou assumir aqui que enviamos para todos os ADMINs como alerta geral do sistema
        List<Usuario> admins = usuarioRepository.findByFuncao(FuncaoUsuario.ADMINISTRADOR);

        for (AreaCultivo area : areas) {
            try {
                // Busca dados na NASA (Média dos últimos 7 dias)
                GeolocalizacaoService.DadosSolares dados = geolocalizacaoService.buscarDadosExternos(area.getIdArea());

                // REGRA 1: Alerta de Baixa Umidade (Risco de Seca/Incêndio)
                if (dados.umidadeMedia < 40.0) {
                    criarAlertaParaAdmins(admins,
                            "Alerta de Seca: " + area.getNomeArea(),
                            "A umidade média recente está crítica (" + dados.umidadeMedia + "%). Reforce a irrigação."
                    );
                }

                // REGRA 2: Alerta de Baixa Luminosidade (Dias muito nublados afetando fotossíntese)
                // A radiação solar média varia de 0 a 10 kWh/m²/dia. Abaixo de 3 é bem baixo.
                if (dados.incidenciaSolarMedia < 3.0) {
                    criarAlertaParaAdmins(admins,
                            "Baixa Luminosidade: " + area.getNomeArea(),
                            "Incidência solar média baixa (" + dados.incidenciaSolarMedia + "). Monitore o desenvolvimento."
                    );
                }

            } catch (Exception e) {
                System.err.println("Erro ao verificar clima da área " + area.getNomeArea());
            }
        }
    }

    private void criarAlertaParaAdmins(List<Usuario> admins, String titulo, String mensagem) {
        for (Usuario admin : admins) {
            notificacaoService.criarNotificacao(
                    admin.getIdUsuario(),
                    titulo,
                    mensagem,
                    "alerta" // Tipo amarelo/laranja no front
            );
        }
    }
}