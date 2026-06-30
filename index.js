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
        const {name, category, canTeach} = req.body

        const userResult = await pool.query(
            'SELECT name FROM users WHERE id = $1',[req.userId]
        )
        const author = userResult.rows[0].name

        const result = await pool.query(
            'INSERT INTO skills (name, category, author, can_teach, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, category, author, canTeach, req.userId] 
        )
        res.json(result.rows[0])
    })

    app.delete('/api/skills/:id', authMiddleware, async (req, res) => {
        const id = req.params.id
        const userId = req.userId
        const result = await pool.query(
            'DELETE FROM skills WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]
        )
        if(!result.rows[0]){
            return res.status(403).json({error: 'You can only delete your own skill'})
        }
        res.json(result.rows[0])
    })

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
