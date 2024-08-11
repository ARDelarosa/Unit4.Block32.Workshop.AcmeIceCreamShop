const express = require('express')
const app = express()
const pg = require('pg')

const client = new pg.Client(process.env.DATABASE_URL || 
    'postgres://postgres:Viper001@localhost:5432/ace_icecream_shop_db')

app.use(express.json());

app.use(require('morgan')('dev'));

// app routes & CRUD 
app.post('/api/flavors', async (req, res, next) => {
    try {
        const body = req.body
        const flavor = body.flavor
        const SQL =`
        INSERT INTO flavors(flavor)
        VALUES ($1)
        RETURNING *;
        `;
        const response = await client.query(SQL,[flavor]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    };
});
app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL =`
        SELECT * from flavors ORDER BY created_at DESC;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error);
    };
});
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL =`
        SELECT * from flavors;
        `;
        const response = await client.query(SQL);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    };
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const body = req.body
        const flavor = body.flavor
        const favorite = body.favorite
        const SQL =`
        UPDATE flavors
        SET flavor=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3 RETURNING *;
        `;
        const response = await client.query(SQL, [flavor, favorite, id]);
        res.send(response.rows[0]);
    } catch (error) {
        next(error);
    };
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL =`
        DELETE FROM flavors
        WHERE id =$1;
        `;
        const id = req.params.id
        const response = await client.query(SQL [id]);
        res.sendStatus(204)
        res.send(response.rows);
    } catch (error) {
        next(error);
    };
});

// create init function and the tables
const init = async () => {
    await client.connect();
    console.log('connected to the database');
    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now(),
        is_favorite BOOLEAN DEFAULT FALSE,
        flavor VARCHAR(50) NOT NULL
    );
    `;
    await client.query(SQL);
    console.log('tables created');
     SQL=`
    INSERT INTO flavors (flavor, is_favorite) VALUEs('vanilla', false);
    INSERT INTO flavors (flavor, is_favorite) VALUEs('chocolate',false);
    INSERT INTO flavors (flavor, is_favorite) VALUEs('strawberry', true);
    `
    await client.query(SQL);
    console.log('data seeded');
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));

}

init()