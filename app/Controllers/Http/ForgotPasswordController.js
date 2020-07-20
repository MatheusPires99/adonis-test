'use strict'

const crypto = require('crypto');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User');
const Mail = use('Mail');

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

    await Mail.send(
      ['emails.forgot_password'],
      {
        email,
        token: user.token,
        link: `${request.input('redirect_url')}?token=${user.token}`
      },
      message => {
        message
          .to(user.email)
          .from('matheushenriquepires99@gmail.com', 'Matheus Pires')
          .subject('Recuperação de senha')
      }
    )
  }
}

module.exports = ForgotPasswordController
