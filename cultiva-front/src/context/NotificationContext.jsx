import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notificacao, setNotificacao] = useState(null);

    const notify = useCallback((message, type = 'success') => {
        setNotificacao({ message, type });
        // Auto-remove após 4 segundos
        setTimeout(() => setNotificacao(null), 4000);
    }, []);

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            {notificacao && (
                <div className={`toast-container animate-slide-in ${notificacao.type}`}>
                    <div className="toast-icon">
                        {notificacao.type === 'success' && <CheckCircle size={20} />}
                        {notificacao.type === 'error' && <AlertCircle size={20} />}
                        {notificacao.type === 'info' && <Info size={20} />}
                    </div>
                    <div className="toast-message">{notificacao.message}</div>
                    <button onClick={() => setNotificacao(null)} className="toast-close">
                        <X size={16} />
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotify = () => useContext(NotificationContext);