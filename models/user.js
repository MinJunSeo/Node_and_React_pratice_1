const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 70
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
});

// 출처 : https://stackoverflow.com/questions/14588032/mongoose-password-hashing
// user 정보 저장 전에 password 암호화
userSchema.pre('save', async function(next) {
  const user = this;
  
  if (!user.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// 평문 비밀번호를 암호화된 비밀번호와 동일한 비밀번호인지 비교
userSchema.methods.comparePassword = function(plainPassword, callback) {
  bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
    if (err) {
      return callback(err);
    }
    callback(null, isMatch);
  })
};

userSchema.methods.generateToken = function(callback) {
  const user = this;
  // jsonwebtoken 이용해 token 생성
  const token = jwt.sign( user._id.toHexString(), 'secretToken');
  
  user.token = token;
  user.save(function(err, user) {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

userSchema.statics.findByToken = function(token, callback) {
  const user = this;
  
  // 토큰을 decode한다.
  jwt.verify(token, 'secretToken', function(err, decoded) {
    user.findOne({ "_id": decoded, "token": token }, function(err, user) {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = { User };