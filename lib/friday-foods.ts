import type { Food } from './foods';

// "Ăn trưa thứ 6": a nicer sit-down lunch at a real restaurant within ~1.5 km of
// 52 Lê Đại Hành, Hai Bà Trưng. `price` is an approximate per-person spend in
// thousands of VND (200k–400k), estimated from each venue's 2026 menu / lunch
// set — buffet chains (Kichi/Gogi/Sumo) run higher at dinner. `sub` names the
// venue + area; `image` reuses the existing lunch atlas so every dish shows a
// real photo. See docs/food-price-audit-2026-09.md.
export function fridayRarity(priceInThousands: number) {
  return priceInThousands <= 240 ? 0
    : priceInThousands <= 280 ? 1
    : priceInThousands <= 320 ? 2
    : priceInThousands <= 360 ? 3
    : 4;
}

type FridayEntry = Omit<Food, 'rarity'>;

const entries: FridayEntry[] = [
  { name: 'Oyakodon trứng gà', sub: 'Yakimono • Triệu Việt Vương', price: 200, image: 92, quip: 'Thứ 6 rồi, ăn tử tế một bữa.' },
  { name: 'Poke bowl cá hồi', sub: 'Poke Hà Nội • Bà Triệu', price: 210, image: 67, quip: 'Nhẹ nhàng mà vẫn ra dáng đãi mình.' },
  { name: 'Lẩu băng chuyền cá nhân', sub: 'Kichi-Kichi • Vincom Bà Triệu', price: 250, image: 71, quip: 'Đĩa cứ chạy, tay cứ gắp.' },
  { name: 'Tempura tôm & rau', sub: 'Tenkai • Triệu Việt Vương', price: 240, image: 93, quip: 'Giòn tan, xứng đáng cuối tuần.' },
  { name: 'Mì Ý hải sản', sub: "Al Fresco's • Vincom Bà Triệu", price: 250, image: 70, quip: 'Nĩa xoáy một vòng là quên deadline.' },
  { name: 'Cà ri Ấn & bánh naan', sub: 'Ganges • Ngõ Huế', price: 250, image: 103, veg: false, quip: 'Chấm naan, đổi vị cho tuần mới.' },
  { name: 'Set nướng bò Mỹ', sub: 'Gogi House • Vincom Bà Triệu', price: 320, image: 65, quip: 'Nướng xèo xèo, thứ 6 đúng nghĩa.' },
  { name: 'Pizza burrata', sub: "Pizza 4P's • Mai Hắc Đế", price: 260, image: 69, quip: 'Kéo phô mai dài bằng cả tuần vừa qua.' },
  { name: 'Cá hồi Na Uy áp chảo', sub: 'Runam Bistro • Lý Thường Kiệt', price: 270, image: 63, quip: 'Da giòn, lòng nhẹ tênh.' },
  { name: 'Vịt quay & mì tươi', sub: 'Hutong • Vincom Bà Triệu', price: 280, image: 48, quip: 'Da vịt giòn hơn tinh thần đi làm.' },
  { name: 'Gnocchi sốt kem bơ', sub: "Pizza 4P's • Mai Hắc Đế", price: 280, image: 118, quip: 'Mềm oặt như mình chiều thứ 6.' },
  { name: 'Unadon lươn nướng', sub: 'Chie Dela Chie • Triệu Việt Vương', price: 300, image: 64, quip: 'Lươn phủ kín cơm, ví thì mỏng đi.' },
  { name: 'Lẩu Đài Loan', sub: 'Manwah • Vincom Bà Triệu', price: 300, image: 101, quip: 'Nước lẩu chua cay, tuần trôi qua.' },
  { name: 'Risotto nấm truffle', sub: 'Capricciosa • Vincom Bà Triệu', price: 300, image: 117, veg: true, quip: 'Thơm mùi truffle, sang mùi cuối tuần.' },
  { name: 'Dimsum cao cấp', sub: 'Crystal Jade • Vincom Bà Triệu', price: 300, image: 86, quip: 'Ba xửng nhỏ, một buổi trưa to.' },
  { name: 'Bít tết bò Úc', sub: 'Moo Beef Steak • Trần Hưng Đạo', price: 320, image: 62, quip: 'Dao cắt ngọt, đầu óc cũng nhẹ.' },
  { name: 'Sukiyaki bò', sub: 'Sumo BBQ • Vincom Bà Triệu', price: 320, image: 102, quip: 'Nhúng trứng, gắp thịt, hết giờ trưa.' },
  { name: 'Sườn cừu nướng', sub: 'Moo Beef Steak • Trần Hưng Đạo', price: 340, image: 68, quip: 'Gặm sườn cuối tuần, ai nói gì kệ.' },
  { name: 'Set sushi & sashimi', sub: 'Isushi • Triệu Việt Vương', price: 350, image: 4, quip: 'Miếng nào cũng như phần thưởng.' },
  { name: 'Cơm bò Wagyu nướng', sub: 'Gyu-Kaku • Vincom Bà Triệu', price: 360, image: 65, quip: 'Vân mỡ đẹp hơn KPI tháng này.' },
  { name: 'Sashimi cá hồi thượng hạng', sub: 'Sushi Hokkaido Sachi • Bà Triệu', price: 380, image: 4, quip: 'Legendary drop. Ví bạn vừa disconnect.' },
  { name: 'Buffet hải sản trưa', sub: 'Poseidon • Trần Hưng Đạo', price: 400, image: 47, quip: 'Ăn cho lại vốn cả tuần.' },
  { name: 'Bò Wagyu áp chảo', sub: 'El Gaucho • Nhà Thờ', price: 400, image: 62, quip: 'Chốt kèo này thì cả năm nhắc lại.' },
];

export const fridayFoods: Food[] = entries.map((food) => ({
  ...food,
  rarity: fridayRarity(food.price),
}));
