    const express = require('express') // import express
    const cors = require('cors') // import cors
    const pool = require('./db') // import db
    const authRoutes = require('./routes/auth')
    const authMiddleware = require('./middleware/auth')
    const transporter = require('./mailer')

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

    app.post('/api/skills/:id/contact', authMiddleware, async (req, res) => {
        const id = req.params.id
        const mssg = req.body.mssg

        const skillResult = await pool.query('SELECT * FROM skills WHERE id = $1', [id])
        const skill = skillResult.rows[0]
        const authorResult = await pool.query('SELECT * FROM users WHERE id = $1', [skill.user_id])
        const author = authorResult.rows[0]
        const senderResult = await pool.query("SELECT name, email FROM users WHERE id = $1", [req.userId])
        const sender = senderResult.rows[0]

        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to: author.email,
            subject: `New message about your skill: ${skill.name}`,
            text: `Message from ${sender.name} (${sender.email}):\n\n${mssg}`
        })

        res.json({success: true})
    } )
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })

    app.put('/api/skills/:id', authMiddleware, async (req, res) =>{
        const id = req.params.id
        const {name, category, canTeach} = req.body

        const result = await pool.query(
            'UPDATE skills SET name=$1, category=$2, can_teach=$3 WHERE id=$4 AND user_id=$5 RETURNING *', [name, category, canTeach, id, req.userId]
        )
        if (!result.rows[0]) {
            return res.status(403).json({ error: 'You can only edit your own skills' })
        }
        res.json(result.rows[0])
    })
