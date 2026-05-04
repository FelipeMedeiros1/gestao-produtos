class DadosProduto {
  constructor(id, nome, preco, quantidade, descricao, categoria) {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
    this.descricao = descricao;
    this.categoria = categoria;
  }

  getId() {
    return this.id;
  }

  getNome() {
    return this.nome;
  }

  getPreco() {
    return this.preco;
  }

  getQuantidade() {
    return this.quantidade;
  }

  getDescricao() {
    return this.descricao;
  }

  getCategoria() {
    return this.categoria;
  }

  setNome(nome) {
    this.nome = nome;
  }

  setPreco(preco) {
    this.preco = preco;
  }

  setQuantidade(quantidade) {
    this.quantidade = quantidade;
  }

  setDescricao(descricao) {
    this.descricao = descricao;
  }

  setCategoria(categoria) {
    this.categoria = categoria;
  }

  toString() {
    return `ID: ${this.id}, Nome: ${this.nome}, Preço: R$ ${this.preco.toFixed(2)}, Quantidade: ${this.quantidade}, Descrição: ${this.descricao}, Categoria: ${this.categoria}`;
  }
}

module.exports = DadosProduto;
