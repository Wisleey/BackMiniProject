function sanitizarUsuario(usuario) {
  if (!usuario) {
    return null
  }

  const { senhaHash, ...usuarioSemSenha } = usuario
  return usuarioSemSenha
}

module.exports = {
  sanitizarUsuario
}
