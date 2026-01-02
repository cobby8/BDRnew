const { Client } = require('pg');

const config = {
    user: 'postgres',
    password: 'postgres', // Default password
    host: 'localhost',
    port: 5432,
    database: 'postgres', // Connect to default DB to create new one
};

async function createDatabase() {
    const client = new Client(config);

    try {
        await client.connect();
        console.log('Connected to PostgreSQL server.');

        const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'bdr_db'");
        if (res.rowCount === 0) {
            await client.query('CREATE DATABASE bdr_db');
            console.log('Database bdr_db created successfully.');
        } else {
            console.log('Database bdr_db already exists.');
        }
    } catch (err) {
        if (err.code === '28P01') {
            console.error('Authentication failed. Please check password.');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('Connection refused. PostgreSQL server is likely down.');
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    } finally {
        await client.end();
    }
}

createDatabase();
