const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const config = require('./config/key');
const { User } = require('./models/user');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.error(err));

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/register', (req, res) => {
  const user = new User(req.body);
  user.save((err, userInfo) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).json({
      success: true
    });
  });
});

app.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {  // input한 email에 해당하는 user가 존재하지 않는다면
      return res.json({
        loginSuccess: false,
        message: '입력하신 이메일 혹은 비밀번호가 틀렸습니다.'
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch) {
        return res.json({
          loginSuccess: false,
          message: '입력하신 이메일 혹은 비밀번호가 틀렸습니다.'
        });
      }

      // 토큰 생성
      user.generateToken((err, user) => {
        if (err) {
          return res.status(400).send(err);
        }
        // 토큰을 쿠키에 저장
        res.cookie('x_auth', user.token).status(200).json({
          loginSuccess: true,
          userID: user._id
        });
      })
    })
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));