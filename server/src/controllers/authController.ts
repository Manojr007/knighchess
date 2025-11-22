import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET as string, {
        expiresIn: '30d',
    });
};

export const signup = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    try {
        console.log('Signup attempt:', { username, email });

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            passwordHash,
        });

        if (user) {
            console.log('User created successfully:', user._id);
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id.toString()),
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        console.error('Signup Error:', error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `${field === 'username' ? 'Username' : 'Email'} already exists`
            });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt:', { email });

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('Login successful:', user._id);
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id.toString()),
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    // @ts-ignore
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
