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

/*
  Menú DE DEFINICIÓN (déficit), ~1.900-2.000 kcal y alto en proteína.
  Pocos ingredientes que se repiten → lista de la compra corta y fácil de
  cocinar en tandas (batch cooking). Solo 2 desayunos, 2 comidas, 1 merienda
  y 2 cenas que van rotando.
*/

// --- DESAYUNOS ---
const desA = meal('Desayuno', '08:00', 470, 38, 58, 11, [
  'Avena | 70 g',
  'Leche desnatada | 250 ml',
  'Plátano | 1 ud',
  'Proteína en polvo | 1 scoop',
]);
const desB = meal('Desayuno', '08:00', 450, 30, 24, 26, [
  'Huevos | 3-4 ud',
  'Pan integral | 50 g',
  'Aguacate | 1/2 ud',
  'Tomate | —',
]);

// --- COMIDAS (cocinar en tandas) ---
const comPollo = meal('Comida', '14:00', 610, 55, 66, 14, [
  'Pollo a la plancha | 200 g',
  'Arroz | 80 g (en seco)',
  'Verdura (menestra) | —',
  'Aceite de oliva | 8 ml',
]);
const comTernera = meal('Comida', '14:00', 600, 50, 55, 22, [
  'Ternera picada magra | 180 g',
  'Patata | 300 g',
  'Ensalada | —',
  'Aceite de oliva | 8 ml',
]);

// --- MERIENDA ---
const merienda = meal('Merienda', '17:30', 290, 24, 26, 11, [
  'Yogur griego natural | 200 g',
  'Manzana | 1 ud',
  'Nueces | 20 g',
]);
const meriendaB = meal('Merienda', '17:30', 270, 26, 24, 7, [
  'Pan integral | 50 g',
  'Pavo / atún | 90 g',
  'Tomate | —',
]);

// --- CENAS ---
const cenaPescado = meal('Cena', '21:00', 500, 46, 40, 15, [
  'Pescado blanco / salmón | 200 g',
  'Boniato | 200 g',
  'Ensalada | —',
  'Aceite de oliva | 8 ml',
]);
const cenaTortilla = meal('Cena', '21:00', 490, 30, 26, 28, [
  'Huevos | 3 ud',
  'Verdura salteada | —',
  'Pan integral | 40 g',
  'Aguacate | 1/2 ud',
]);

function buildDay(weekday: number): DayMenu {
  const i = weekday - 1; // 0..6
  const des = i % 5 === 4 ? desB : desA; // viernes cambia
  const com = i % 2 === 0 ? comPollo : comTernera;
  const mer = i === 2 ? meriendaB : merienda;
  const cen = i % 2 === 0 ? cenaPescado : cenaTortilla;
  return {
    weekday,
    meals: [des, com, mer, cen].map((m) => ({ ...m, id: `${m.id}-${weekday}` })),
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
