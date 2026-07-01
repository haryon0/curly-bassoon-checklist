const bcrypt = require('bcryptjs');

const password = 'password1234';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hash untuk password "password1234":');
  console.log(hash);
});