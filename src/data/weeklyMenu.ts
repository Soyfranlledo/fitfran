import type { DayMenu } from '../types';

let _m = 0;
const meal = (
  name: string,
  time: string,
  kcal: number,
  protein: number,
  carbs: number,
  fat: number,
  items: string[]
) => ({
  id: `m${_m++}`,
  name,
  time,
  kcal,
  protein,
  carbs,
  fat,
  items: items.map((t) => {
    const [n, q] = t.split('|');
    return { name: n.trim(), qty: q?.trim() };
  }),
});

/* Plantillas reutilizables para que el menú sea variado pero coherente */
const desayunos = [
  meal('Desayuno', '08:00', 480, 35, 50, 14, [
    'Avena|60 g', 'Leche desnatada|250 ml', 'Plátano|1 ud', 'Proteína whey|1 scoop', 'Crema de cacahuete|10 g',
  ]),
  meal('Desayuno', '08:00', 460, 34, 40, 16, [
    'Tortilla 3 huevos|—', 'Pan integral|60 g', 'Aguacate|1/2 ud', 'Tomate|—',
  ]),
  meal('Desayuno', '08:00', 470, 38, 45, 13, [
    'Yogur griego|200 g', 'Granola|40 g', 'Arándanos|80 g', 'Miel|10 g', 'Nueces|15 g',
  ]),
];

const comidas = [
  meal('Comida', '14:00', 720, 55, 70, 22, [
    'Pechuga de pollo|180 g', 'Arroz blanco|80 g (seco)', 'Verduras salteadas|—', 'Aceite de oliva|10 ml',
  ]),
  meal('Comida', '14:00', 740, 52, 65, 26, [
    'Salmón|180 g', 'Patata cocida|250 g', 'Ensalada|—', 'Aceite de oliva|10 ml',
  ]),
  meal('Comida', '14:00', 700, 58, 72, 18, [
    'Ternera magra|170 g', 'Pasta integral|80 g (seca)', 'Tomate y cebolla|—', 'Aceite de oliva|8 ml',
  ]),
  meal('Comida', '14:00', 690, 50, 75, 20, [
    'Lentejas|90 g (secas)', 'Arroz|40 g', 'Huevo|1 ud', 'Verduras|—', 'Aceite de oliva|10 ml',
  ]),
];

const meriendas = [
  meal('Merienda', '17:30', 280, 28, 22, 8, [
    'Yogur griego|200 g', 'Frutos rojos|100 g', 'Proteína|1/2 scoop',
  ]),
  meal('Merienda', '17:30', 290, 22, 30, 9, [
    'Tostada integral|2 ud', 'Pavo|80 g', 'Queso fresco|40 g',
  ]),
  meal('Merienda', '17:30', 270, 18, 28, 10, [
    'Manzana|1 ud', 'Almendras|25 g', 'Yogur natural|125 g',
  ]),
];

const cenas = [
  meal('Cena', '21:00', 560, 48, 35, 24, [
    'Merluza al horno|200 g', 'Boniato|200 g', 'Espárragos|—', 'Aceite de oliva|10 ml',
  ]),
  meal('Cena', '21:00', 540, 45, 30, 26, [
    'Tortilla 4 huevos|—', 'Champiñones|—', 'Pan integral|40 g', 'Aguacate|1/2 ud',
  ]),
  meal('Cena', '21:00', 580, 50, 38, 22, [
    'Pollo a la plancha|180 g', 'Quinoa|70 g (seca)', 'Ensalada variada|—', 'Aceite de oliva|8 ml',
  ]),
  meal('Cena', '21:00', 520, 46, 28, 23, [
    'Tofu / tempeh|200 g', 'Verduras al wok|—', 'Arroz|40 g', 'Sésamo y aceite|—',
  ]),
];

function buildDay(weekday: number): DayMenu {
  const i = weekday - 1;
  return {
    weekday,
    meals: [
      desayunos[i % desayunos.length],
      comidas[i % comidas.length],
      meriendas[i % meriendas.length],
      cenas[i % cenas.length],
    ].map((m) => ({ ...m, id: `${m.id}-${weekday}` })),
  };
}

export const DEFAULT_MENU: DayMenu[] = [1, 2, 3, 4, 5, 6, 7].map(buildDay);

export function menuTotals(day: DayMenu) {
  return day.meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
