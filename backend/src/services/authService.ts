import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

const SALT_ROUNDS = 10;

export const authService = {
    async register(name: string, email: string, password: string) {
        email = email.toLowerCase().trim();

        const existing = await User.findOne({ email });
        if (existing) {
            throw ApiError.badRequest('A user with this email already exists.');
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = await User.create({
            name,
            email,
            passwordHash,
        });

        const userId = user._id.toString();
        const token = createToken(userId, user.email);

        return {
            user: { id: userId, name: user.name, email: user.email },
            token,
        };
    },

    async login(email: string, password: string) {
        email = email.toLowerCase().trim();

        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.unauthorized('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw ApiError.unauthorized('Invalid email or password.');
        }

        const userId = user._id.toString();
        const token = createToken(userId, user.email);

        return {
            user: { id: userId, name: user.name, email: user.email },
            token,
        };
    },

    async getProfile(userId: string) {
        const user = await User.findById(userId).select('name email createdAt');
        if (!user) {
            throw ApiError.notFound('User not found.');
        }
        return user;
    },
};

function createToken(userId: string, email: string) {
    return jwt.sign(
        { sub: userId, email },
        env.JWT_SECRET,
        { expiresIn: '7d' },
    );
}
