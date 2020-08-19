const { User } = require('../models/user');

const auth = (req, res, next) => {
  // 클라이언트 쿠키에서 토큰을 가져옴
  const token = req.cookies.x_auth;

  // 토큰을 복호화한 후 user를 찾는다.
  User.findByToken(token, (err, user) => {
    if (err) {
      throw err;
    }
    if (!user) {
      return res.json({
        isAuth: false,
        error: true
      });
    }

    req.token = token;
    req.uset = token;
    next();
  });
};

module.exports = { auth };