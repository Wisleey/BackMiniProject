function limparCnpj(valor) {
  return String(valor || "").replace(/\D/g, "")
}

function cnpjTodosDigitosIguais(cnpj) {
  return /^(\d)\1+$/.test(cnpj)
}

function calcularDigito(cnpjBase, pesos) {
  const soma = cnpjBase.split("").reduce((acumulador, digito, indice) => {
    return acumulador + Number(digito) * pesos[indice]
  }, 0)

  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

function validarCnpj(valor) {
  const cnpj = limparCnpj(valor)

  if (cnpj.length !== 14 || cnpjTodosDigitosIguais(cnpj)) {
    return false
  }

  const base = cnpj.slice(0, 12)
  const primeiroDigito = calcularDigito(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const segundoDigito = calcularDigito(
    `${base}${primeiroDigito}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  )

  return cnpj === `${base}${primeiroDigito}${segundoDigito}`
}

module.exports = {
  limparCnpj,
  validarCnpj
}
