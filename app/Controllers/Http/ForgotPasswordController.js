'use strict'

const crypto = require('crypto');
const User = use('App/Models/User');

class ForgotPasswordController {
  async store({ request, response }) {
    const email = request.input('email');
    const user = await User.findBy('email', email);

    if (!user) {
      return response.status(400).send({ error: { message: 'User not found' } });
    }

    user.token = crypto.randomBytes(10).toString('hex');
    user.token_created_at = new Date();

    await user.save();
  }
}

module.exports = ForgotPasswordController
