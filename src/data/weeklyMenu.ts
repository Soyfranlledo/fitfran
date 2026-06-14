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
const desA = meal('Desayuno', '08:00', 520, 42, 62, 13, [
  'Avena | 80 g',
  'Leche desnatada | 300 ml',
  'Plátano | 1 ud',
  'Proteína en polvo | 1 scoop',
  'Crema de cacahuete | 10 g',
]);
const desB = meal('Desayuno', '08:00', 510, 34, 32, 28, [
  'Huevos | 4 ud',
  'Pan integral | 60 g',
  'Aguacate | 1/2 ud',
  'Tomate | —',
]);

// --- COMIDAS (cocinar en tandas) ---
const comPollo = meal('Comida', '14:00', 720, 60, 85, 16, [
  'Pollo a la plancha | 220 g',
  'Arroz | 100 g (en seco)',
  'Verdura (menestra) | —',
  'Aceite de oliva | 10 ml',
]);
const comTernera = meal('Comida', '14:00', 710, 56, 72, 24, [
  'Ternera picada magra | 200 g',
  'Patata | 350 g',
  'Ensalada | —',
  'Aceite de oliva | 10 ml',
]);

// --- MERIENDA ---
const merienda = meal('Merienda', '17:30', 330, 28, 32, 11, [
  'Yogur griego natural | 250 g',
  'Plátano / manzana | 1 ud',
  'Nueces | 20 g',
]);
const meriendaB = meal('Merienda', '17:30', 320, 30, 30, 8, [
  'Pan integral | 60 g',
  'Pavo / atún | 100 g',
  'Tomate | —',
]);

// --- CENAS ---
const cenaPescado = meal('Cena', '21:00', 620, 50, 55, 18, [
  'Pescado blanco / salmón | 220 g',
  'Boniato | 250 g',
  'Ensalada | —',
  'Aceite de oliva | 10 ml',
]);
const cenaTortilla = meal('Cena', '21:00', 600, 36, 34, 34, [
  'Huevos | 4 ud',
  'Verdura salteada | —',
  'Pan integral | 50 g',
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
