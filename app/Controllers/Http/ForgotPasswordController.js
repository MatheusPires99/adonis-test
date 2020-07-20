'use strict'

const crypto = require('crypto');
const moment = require('moment');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const User = use('App/Models/User');
const Mail = use('Mail');

class ForgotPasswordController {
  async store({ request, response }) {
    const email = request.input('email');
    const user = await User.findBy('email', email);

    if (!user) {
      return response.status(401).send({ error: { message: 'User not found' } });
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

  async update({ request, response }) {
    const { token, password } = request.all();

    const user = await User.findBy('token', token);

    if (!user) {
      return response.status(401).send({ error: { message: 'User not found' } });
    }

    const tokenExpired = moment().subtract('2', 'days').isAfter(user.token_created_at);

    if (tokenExpired) {
      return response.status(401).send({ error: { message: 'Reset token expired' } });
    }

    user.token = null;
    user.token_created_at = null;

    user.password = password;

    await user.save();
  }
}

module.exports = ForgotPasswordController
