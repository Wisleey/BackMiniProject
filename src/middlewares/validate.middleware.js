function validar(schema, propriedade = "body") {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req[propriedade])

    if (!resultado.success) {
      return next(resultado.error)
    }

    req[propriedade] = resultado.data
    return next()
  }
}

module.exports = {
  validar
}
