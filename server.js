
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

app.get('/survey-stats', async (req, res) => {
    const client = await pool.connect();
    try {
        // Total surveys
        const totalResult = await client.query('SELECT COUNT(*) FROM surveys');
        const total = parseInt(totalResult.rows[0].count);

        // Ages
        const ageResult = await client.query(`
            SELECT 
                MIN(EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) AS youngest,
                MAX(EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) AS oldest,
                AVG(EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))) AS average
            FROM surveys
        `);
        const youngest = Math.floor(ageResult.rows[0].youngest || 0);
        const oldest = Math.floor(ageResult.rows[0].oldest || 0);
        const average = ageResult.rows[0].average ? parseFloat(ageResult.rows[0].average).toFixed(1) : "0.0";

        // Food percentages
        const foodNames = ['Pizza', 'Pasta', 'Pap and Wors'];
        const foodPercents = {};
        for (const food of foodNames) {
            const foodResult = await client.query(
                `SELECT COUNT(DISTINCT survey_id) AS count FROM survey_favorite_foods WHERE food = $1`, [food]
            );
            foodPercents[food] = total > 0 ? ((parseInt(foodResult.rows[0].count) / total) * 100).toFixed(1) : "0.0";
        }

        // Average ratings for each question
        const questions = [
            'I like to watch movies',
            'I like to listen to radio',
            'I like to eat out',
            'I like to watch TV'
        ];
        const avgRatings = {};
        for (const q of questions) {
            const r = await client.query(
                `SELECT AVG(rating) AS avg FROM survey_ratings WHERE question = $1`, [q]
            );
            avgRatings[q] = r.rows[0].avg ? parseFloat(r.rows[0].avg).toFixed(1) : "0.0";
        }

        res.json({
            total,
            average,
            oldest,
            youngest,
            pizzaPercent: foodPercents['Pizza'],
            pastaPercent: foodPercents['Pasta'],
            papPercent: foodPercents['Pap and Wors'],
            avgMovies: avgRatings['I like to watch movies'],
            avgRadio: avgRatings['I like to listen to radio'],
            avgEatOut: avgRatings['I like to eat out'],
            avgTV: avgRatings['I like to watch TV']
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    } finally {
        client.release();
    }
});