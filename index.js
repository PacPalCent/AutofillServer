const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const express = require('express')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(bodyParser.json());

const users = [];

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello world!')
})

app.get('/.well-known/apple-app-site-association', function(req, res) {
  res.sendFile(path.join(__dirname, 'Public', '.well-known', 'apple-app-site-association'));
});

app.post('/api/user', async (req, res) => {
  const { username, password } = req.body

  // Validate input data
  if (!username || !password) {
    return res.status(400).send({ message: 'Username and password are required' })
  }

  // Check if user already exists
  const existingUser = users.find(user => user.username === username)
  if (existingUser) {
    return res.status(400).send({ message: 'Username is already taken' })
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user object with UUID as ID
    const user = { id: uuidv4(), username, password: hashedPassword }
    users.push(user)

    // Generate and sign JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, 'secret-key')

    // Return token and user ID to user
    res.send({ token, userID: user.id })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: 'Internal server error' })
  }
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
