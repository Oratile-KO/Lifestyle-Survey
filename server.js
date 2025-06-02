
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lifestyle_survey',
    password: '66743638873',
    port: 5432,
});


app.post('/submit-survey', async (req, res) => {
    console.log('BODY:', req.body);
    const { full_name, email, date_of_birth, contact_number, favourite_foods, ratings } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Insert survey and get its ID
        console.log('Inserting personal details');
        const surveyResult = await client.query(
            'INSERT INTO surveys (full_name, email, date_of_birth, contact_number) VALUES ($1, $2, $3, $4) RETURNING id',
            [full_name, email, date_of_birth, contact_number]
        );
        const surveyId = surveyResult.rows[0].id;

         console.log('Survey ID:', surveyId);
        console.log('Favourite Foods:', favourite_foods);
        console.log('Ratings:', ratings);


        // Insert each favorite food
        for (const food of favourite_foods || []) {
             console.log('Inserting food:', food);
            await client.query(
                'INSERT INTO survey_favorite_foods (survey_id, food) VALUES ($1, $2)',
                [surveyId, food]
            );
        }

        // Insert each rating
        for (const r of ratings || []) {
             console.log('Inserting rating:', r);
            await client.query(
                'INSERT INTO survey_ratings (survey_id, question, rating) VALUES ($1, $2, $3)',
                [surveyId, r.question, r.rating]
            );
        }

        await client.query('COMMIT');
        res.status(200).send('Survey submitted');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).send('Database error');
    } finally {
        client.release();
    }
}); const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});