const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Authenticate user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password, token } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // If 2FA is enabled, verify the token
    if (user.twoFactorEnabled) {
      if (!token) {
        return res.status(200).json({
          requireTwoFactor: true,
          message: 'Two-factor authentication code required',
        });
      }

      // Verify the token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30 seconds window
      });

      if (!verified) {
        // Check if token is a backup code
        const backupCodeIndex = user.twoFactorBackupCodes.findIndex(
          code => code.code === token && !code.used
        );

        if (backupCodeIndex === -1) {
          return res.status(401).json({ message: 'Invalid authentication code' });
        }

        // Mark backup code as used
        user.twoFactorBackupCodes[backupCodeIndex].used = true;
        await user.save();
      }
    }

    // Return user info with token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -twoFactorSecret -twoFactorTempSecret -twoFactorBackupCodes');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Setup 2FA - Generate temp secret
// @route   GET /api/users/2fa/setup
// @access  Private
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new temporary secret
    const tempSecret = speakeasy.generateSecret({
      name: `TaskManager:${user.email}`,
      length: 20
    });

    // Save temp secret to user
    user.twoFactorTempSecret = tempSecret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(tempSecret.otpauth_url);

    res.json({
      tempSecret: tempSecret.base32,
      qrCodeUrl,
      message: 'Temporary secret generated'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify and enable 2FA
// @route   POST /api/users/2fa/verify
// @access  Private
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorTempSecret) {
      return res.status(400).json({ message: 'No temporary secret found' });
    }

    // Verify the token against the temp secret
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorTempSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Move temp secret to permanent and enable 2FA
    user.twoFactorSecret = user.twoFactorTempSecret;
    user.twoFactorTempSecret = null;
    user.twoFactorEnabled = true;
    
    // Generate backup codes
    const backupCodes = user.generateBackupCodes();
    
    await user.save();

    res.json({
      message: 'Two-factor authentication enabled successfully',
      backupCodes: backupCodes.map(code => code.code),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Disable 2FA
// @route   DELETE /api/users/2fa
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password for security
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorTempSecret = null;
    user.twoFactorBackupCodes = [];
    
    await user.save();

    res.json({
      message: 'Two-factor authentication disabled successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};