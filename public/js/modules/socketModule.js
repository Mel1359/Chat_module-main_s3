let socket = null;

export const initializeSocket = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.replace('/login');
            return;
        }

        socket = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            if (error.message === 'Authentication error') {
                localStorage.removeItem('token');
                window.location.replace('/login');
            }
        });

        return socket;
    } catch (error) {
        console.error('Socket initialization error:', error);
        throw error;
    }
};

export const getSocket = () => socket; 