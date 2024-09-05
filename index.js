document.addEventListener('DOMContentLoaded', function() {
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const btnLogin = document.getElementById('btn_login')
  btnLogin.onclick(() => {
    console.log(username, password)
  })
}, false)
