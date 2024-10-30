const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Activer CORS pour toutes les routes
router.use(cors());
router.use(express.json());

// Route d'inscription
router.post('/signup', async (req, res) => {
    const { fullname, dob, email, password, repeatPassword } = req.body;
    

    if (password !== repeatPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already in use.' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer et enregistrer l'utilisateur
        const newUser = new User({
            fullname,
            dob,
            email,
            password: hashedPassword
        });

        await newUser.save();
        return res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        // Vérifier si le mot de passe est valide
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password.' });
        }

        // Créer un JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful!', token });

    } catch (error) {
        console.error('Server error during login:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Route d'accueil (GET)
router.get('/home', (req, res) => {
    res.json({
        message: 'Welcome to the home page!',
        items: ['Item 1', 'Item 2', 'Item 3']
    });
});

module.exports = router;
