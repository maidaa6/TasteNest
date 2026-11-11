import { pathToFileURL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const CATEGORIES = ['Zajtrk', 'Glavne jedi', 'Juhe', 'Solate', 'Sladice', 'Prigrizki'];

const INGREDIENTS = [
  'testenine', 'paradižnik', 'čebula', 'česen', 'olivno olje', 'sol', 'poper', 'parmezan',
  'jajca', 'mleko', 'moka', 'sladkor', 'maslo', 'piščančje prsi', 'riž', 'korenje',
  'krompir', 'zelena solata', 'kumare', 'bazilika', 'kisla smetana', 'jabolka',
];

// Local development accounts; their shared password comes from DEMO_PASSWORD in backend/.env.
const DEMO_USERS = [
  { name: 'Ana Avtorica', email: 'avtor@tastenest.local', role: 'AUTHOR' },
  { name: 'Uroš Uporabnik', email: 'uporabnik@tastenest.local', role: 'USER' },
];

const DEMO_RECIPES = [
  {
    title: 'Testenine s paradižnikovo omako',
    description: 'Hitra večerja iz osnovnih sestavin.',
    instructions: 'Skuhaj testenine. Na olju prepraži čebulo in česen, dodaj paradižnik in kuhaj 10 minut. Začini in premešaj s testeninami.',
    category: 'Glavne jedi',
    baseServings: 2,
    prepMinutes: 25,
    ingredients: [
      ['testenine', 200, 'g'], ['paradižnik', 400, 'g'], ['čebula', 1, 'kos'],
      ['česen', 2, 'kos'], ['olivno olje', 30, 'ml'], ['parmezan', 40, 'g'],
    ],
  },
  {
    title: 'Palačinke',
    description: null,
    instructions: 'Zmešaj moko, jajca, mleko in ščepec soli v gladko testo. Peci na vroči ponvi z malo masla.',
    category: 'Sladice',
    baseServings: 4,
    prepMinutes: 30,
    ingredients: [['moka', 200, 'g'], ['jajca', 2, 'kos'], ['mleko', 0.5, 'l'], ['maslo', 20, 'g']],
  },
  {
    title: 'Korenčkova juha',
    description: 'Kremna juha brez smetane.',
    instructions: 'Na maslu prepraži čebulo, dodaj narezano korenje in krompir, zalij z vodo in kuhaj 20 minut. Zmiksaj in začini.',
    category: 'Juhe',
    baseServings: 4,
    prepMinutes: 35,
    ingredients: [['korenje', 0.6, 'kg'], ['krompir', 200, 'g'], ['čebula', 1, 'kos'], ['maslo', 20, 'g']],
  },
];

export async function seed(prisma, env = process.env) {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of INGREDIENTS) {
    await prisma.ingredient.upsert({ where: { name }, update: {}, create: { name } });
  }

  // The first administrator can only be created here, never through public registration.
  if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
    await prisma.user.upsert({
      where: { email: env.ADMIN_EMAIL.toLowerCase() },
      update: {},
      create: {
        name: env.ADMIN_NAME ?? 'Administrator',
        email: env.ADMIN_EMAIL.toLowerCase(),
        passwordHash: await hashPassword(env.ADMIN_PASSWORD),
        role: 'ADMIN',
      },
    });
  }

  if (env.SEED_DEMO_DATA === 'false') return;
  if (!env.DEMO_PASSWORD) {
    console.warn('DEMO_PASSWORD is not set; skipping demo accounts and recipes.');
    return;
  }

  const passwordHash = await hashPassword(env.DEMO_PASSWORD);
  const users = {};
  for (const data of DEMO_USERS) {
    users[data.role] = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: { ...data, passwordHash },
    });
  }

  for (const { category, ingredients, ...recipe } of DEMO_RECIPES) {
    const exists = await prisma.recipe.findFirst({ where: { title: recipe.title, authorId: users.AUTHOR.id } });
    if (exists) continue;

    await prisma.recipe.create({
      data: {
        ...recipe,
        author: { connect: { id: users.AUTHOR.id } },
        category: { connect: { name: category } },
        ingredients: {
          create: ingredients.map(([name, quantity, unit]) => ({
            ingredient: { connect: { name } },
            quantity,
            unit,
          })),
        },
      },
    });
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const prisma = new PrismaClient();
  seed(prisma)
    .then(() => console.log('Seed completed.'))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
