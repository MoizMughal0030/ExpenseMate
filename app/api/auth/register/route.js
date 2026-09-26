import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../lib/mongodb.js';
import User from '../../../../models/User.js';
import { validateRegistration } from '../../../../utils/validation/authValidation.js';
import { successResponse, errorResponse, handleApiError } from '../../../../utils/response.js';

export async function POST(req) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return errorResponse('Invalid JSON body in request', 400);
    }

    const { isValid, errors, data } = validateRegistration(body);
    if (!isValid) {
      return errorResponse('Validation failed', 400, errors);
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return errorResponse('A user with this email address already exists', 409);
    }

    // Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    return successResponse(
      {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
      201,
      'User registered successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
