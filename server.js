// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3000;

// Replace with your PostgreSQL credentials
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lifestyle_survey',
    password: '66743638873',
    port: 5432,
});

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500'
}));

app.post('/submit-survey', async (req, res) => {
    const { full_name, email, date_of_birth, contact_number } = req.body;
    try {
        await pool.query(
            'INSERT INTO surveys (full_name, email, date_of_birth, contact_number) VALUES ($1, $2, $3, $4)',
            [full_name, email, date_of_birth, contact_number]
        );
        res.status(200).send('Survey submitted');
    } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});