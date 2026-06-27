    const express = require('express') // import express
    const cors = require('cors') // import cors

    const app = express() // creating app

    const PORT = 3000; //doors for front end localhost:3000

    app.use(cors()) 
    app.use(express.json())

    app.get('/', (req, res) =>{
        res.json({message:'Skillswap server is running'})
    })

    const skills = [
    { id: 1, name: 'React', category: 'Frontend', author: 'Alex', canTeach: true },
    { id: 2, name: 'PostgreSQL', category: 'Backend', author: 'Maria', canTeach: false },
    ]

    app.get('/api/skills', (req, res) => {
        res.json(skills)
    })
    app.post('/api/skills', (req, res) => {
        const newSkill = {id: skills.length + 1, ...req.body}
        skills.push(newSkill)
        res.json(newSkill)
    })


    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
