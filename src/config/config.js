import dotenv from 'dotenv';
dotenv.config();

export default {
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 8000,
    API_URL: process.env.API_URL || '/api/v1',
    CONNECTION_STRING: process.env.CONNECTION_STRING || '<<ERROR>> NO SE ENCUENTRA',
    DATABASE: process.env.DATABASE || '<<ERROR>> NO SE ENCUENTRA',
    DB_PASSWORD: process.env.DB_PASSWORD || '<<ERROR>> NO SE ENCUENTRA',
    DB_USER: process.env.DB_USER || '<<ERROR>> NO SE ENCUENTRA',
    JWT_SECRET: process.env.JWT_SECRET || '<<ERROR>> NO SE ENCONTRO jwt',
    ADMIN_REGISTRATION_KEY: process.env.ADMIN_REGISTRATION_KEY || 'LBM_ADMIN_MASTER_SETUP_2026',
};
