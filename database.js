import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: "localhost",
    database: "PersonTask",
    port: 5432,
    user: "personUser",
    password: "12345"
})

export default pool;