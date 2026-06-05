const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  const company = await prisma.company.upsert({
    where: { cnpj: '00.000.000/0001-00' },
    update: {},
    create: {
      name: 'GLC Tecnologia Ltda',
      cnpj: '00.000.000/0001-00',
      email: 'admin@glctecnologia.com.br',
      phone: '(11) 99999-9999',
      address: 'Rua Exemplo, 123 - São Paulo/SP',
    },
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email_companyId: { email: 'admin@glctecnologia.com.br', companyId: company.id } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Administrador',
      email: 'admin@glctecnologia.com.br',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Templates padrão
  const templates = [
    {
      name: 'Prestação de Serviços',
      type: 'SERVICE',
      description: 'Contrato padrão para prestação de serviços',
      content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS\n\nCONTRATANTE: {{contratante_nome}}, inscrito no CNPJ/CPF sob nº {{contratante_doc}}, com sede em {{contratante_endereco}}.\n\nCONTRATADA: {{contratada_nome}}, inscrita no CNPJ/CPF sob nº {{contratada_doc}}.\n\nOBJETO: {{objeto_contrato}}\n\nVALOR: R$ {{valor_mensal}} mensais.\n\nVIGÊNCIA: De {{data_inicio}} a {{data_fim}}.\n\nAssinaturas:\n\n_________________________\n{{contratante_nome}}\n\n_________________________\n{{contratada_nome}}`,
      fields: [
        { name: 'contratante_nome', label: 'Nome do Contratante', type: 'TEXT', required: true, order: 1 },
        { name: 'contratante_doc', label: 'CNPJ/CPF do Contratante', type: 'CNPJ', required: true, order: 2 },
        { name: 'contratante_endereco', label: 'Endereço do Contratante', type: 'ADDRESS', required: true, order: 3 },
        { name: 'contratada_nome', label: 'Nome da Contratada', type: 'TEXT', required: true, order: 4 },
        { name: 'contratada_doc', label: 'CNPJ/CPF da Contratada', type: 'CNPJ', required: true, order: 5 },
        { name: 'objeto_contrato', label: 'Objeto do Contrato', type: 'TEXTAREA', required: true, order: 6 },
        { name: 'valor_mensal', label: 'Valor Mensal (R$)', type: 'CURRENCY', required: true, order: 7 },
        { name: 'data_inicio', label: 'Data de Início', type: 'DATE', required: true, order: 8 },
        { name: 'data_fim', label: 'Data de Término', type: 'DATE', required: true, order: 9 },
      ],
    },
    {
      name: 'Contrato de Obra',
      type: 'WORK',
      description: 'Contrato para execução de obras e reformas',
      content: `CONTRATO DE EXECUÇÃO DE OBRA\n\nCONTRATANTE: {{contratante_nome}}, CNPJ/CPF: {{contratante_doc}}\n\nCONTRATADA: {{contratada_nome}}, CNPJ/CPF: {{contratada_doc}}\n\nOBRA: {{descricao_obra}}\n\nENDEREÇO DA OBRA: {{endereco_obra}}\n\nVALOR TOTAL: R$ {{valor_total}}\n\nPRAZO: {{prazo_execucao}} dias corridos a partir de {{data_inicio}}.\n\nAssinaturas:\n\n_________________________\n{{contratante_nome}}\n\n_________________________\n{{contratada_nome}}`,
      fields: [
        { name: 'contratante_nome', label: 'Nome do Contratante', type: 'TEXT', required: true, order: 1 },
        { name: 'contratante_doc', label: 'CNPJ/CPF do Contratante', type: 'CNPJ', required: true, order: 2 },
        { name: 'contratada_nome', label: 'Nome da Contratada', type: 'TEXT', required: true, order: 3 },
        { name: 'contratada_doc', label: 'CNPJ/CPF da Contratada', type: 'CNPJ', required: true, order: 4 },
        { name: 'descricao_obra', label: 'Descrição da Obra', type: 'TEXTAREA', required: true, order: 5 },
        { name: 'endereco_obra', label: 'Endereço da Obra', type: 'ADDRESS', required: true, order: 6 },
        { name: 'valor_total', label: 'Valor Total (R$)', type: 'CURRENCY', required: true, order: 7 },
        { name: 'prazo_execucao', label: 'Prazo de Execução (dias)', type: 'NUMBER', required: true, order: 8 },
        { name: 'data_inicio', label: 'Data de Início', type: 'DATE', required: true, order: 9 },
      ],
    },
    {
      name: 'Contrato de Locação',
      type: 'LEASE',
      description: 'Contrato de locação de imóvel',
      content: `CONTRATO DE LOCAÇÃO\n\nLOCADOR: {{locador_nome}}, CNPJ/CPF: {{locador_doc}}\n\nLOCATÁRIO: {{locatario_nome}}, CNPJ/CPF: {{locatario_doc}}\n\nIMÓVEL: {{descricao_imovel}}, situado em {{endereco_imovel}}\n\nALUGUEL MENSAL: R$ {{valor_aluguel}}\n\nVIGÊNCIA: De {{data_inicio}} a {{data_fim}}\n\nAssinaturas:\n\n_________________________\n{{locador_nome}}\n\n_________________________\n{{locatario_nome}}`,
      fields: [
        { name: 'locador_nome', label: 'Nome do Locador', type: 'TEXT', required: true, order: 1 },
        { name: 'locador_doc', label: 'CNPJ/CPF do Locador', type: 'CNPJ', required: true, order: 2 },
        { name: 'locatario_nome', label: 'Nome do Locatário', type: 'TEXT', required: true, order: 3 },
        { name: 'locatario_doc', label: 'CNPJ/CPF do Locatário', type: 'CNPJ', required: true, order: 4 },
        { name: 'descricao_imovel', label: 'Descrição do Imóvel', type: 'TEXTAREA', required: true, order: 5 },
        { name: 'endereco_imovel', label: 'Endereço do Imóvel', type: 'ADDRESS', required: true, order: 6 },
        { name: 'valor_aluguel', label: 'Valor do Aluguel (R$)', type: 'CURRENCY', required: true, order: 7 },
        { name: 'data_inicio', label: 'Data de Início', type: 'DATE', required: true, order: 8 },
        { name: 'data_fim', label: 'Data de Término', type: 'DATE', required: true, order: 9 },
      ],
    },
  ];

  for (const tmpl of templates) {
    const { fields, ...templateData } = tmpl;
    await prisma.contractTemplate.upsert({
      where: { id: `seed-${tmpl.type.toLowerCase()}` },
      update: {},
      create: { id: `seed-${tmpl.type.toLowerCase()}`, companyId: company.id, ...templateData, fields: { create: fields } },
    });
  }

  console.log('Seed concluído!');
  console.log(`Empresa: ${company.name}`);
  console.log(`Login: admin@glctecnologia.com.br / admin123`);
  console.log(`CNPJ empresa: 00.000.000/0001-00`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
