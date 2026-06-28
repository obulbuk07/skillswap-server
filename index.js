    const express = require('express') // import express
    const cors = require('cors') // import cors
    const pool = require('./db') // import db
    const authRoutes = require('./routes/auth')
    const authMiddleware = require('./middleware/auth')

    const app = express() // creating app

    const PORT = 3000;
    app.use(cors()) 

    app.use(express.json())
    
    app.use('/api/auth', authRoutes)
    
    app.get('/', (req, res) =>{
        res.json({message:'Skillswap server is running'})
    })

    app.get('/api/skills', async (req, res) => {
        const result = await pool.query('SELECT * FROM skills')
        res.json(result.rows)
    })


    app.post('/api/skills', authMiddleware, async (req, res) => {
        const {name, category, author, canTeach} = req.body
        const result = await pool.query(
            'INSERT INTO skills (name, category, author, can_teach) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, category, author, canTeach] 
        )
        res.json(result.rows[0])
    })

    app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
        const id = req.params.id
        const result = await pool.query(
            'DELETE FROM skills WHERE id = $1 RETURNING *', [id]
        )
        res.json(result.rows[0])
    })

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
