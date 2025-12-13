import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/api'; // Verifique se o caminho para api.js está correto

export const PrivateRoute = () => {
    // Pergunta ao serviço: "Tem usuário salvo no localStorage?"
    const isAuthenticated = authService.usuarioEstaLogado();

    // Se SIM: Deixa passar e renderiza as rotas filhas (Outlet)
    // Se NÃO: Redireciona para /login
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};