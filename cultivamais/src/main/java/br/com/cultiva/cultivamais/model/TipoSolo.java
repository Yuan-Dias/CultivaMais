package br.com.cultiva.cultivamais.model;

public enum TipoSolo {
    // --- Textura e Composição ---
    ARGILOSO,
    ARENOSO,
    SILTOSO,
    HUMOSO,          // Ou HUMIFERO/ORGANICO
    CALCARIO,
    FRANCO,

    // --- Classificação Técnica (Embrapa) ---
    LATOSSOLO,
    ARGISSOLO,
    CHERNOSSOLO,
    NEOSSOLO,
    CAMBISSOLO,
    GLEISSOLO,       // Solos com água em excesso
    NITOSSOLO,

    // --- Regionais / Populares ---
    TERRA_ROXA,
    MASSAPE,
    VARZEA,          // Solos de beira de rio

    // --- Genéricos ---
    MISTO,
    OUTRO
}