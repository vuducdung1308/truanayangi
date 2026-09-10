# Feast atlas (pending)

The "liên hoan nhóm 10" pool ([lib/feast-foods.ts](../lib/feast-foods.ts)) has **40 dishes**, image ids **200–239**. No photo atlas exists yet, so [`FoodImage`](../app/page.tsx) renders `.feast-placeholder` (an SVG platter, rarity-tinted) for any id `>= 200`.

## Atlas format

Match the existing `food-common-0.webp` convention:

- **4 sheets**: `public/food-feast-0.webp` … `food-feast-3.webp`
- Each sheet: landscape 4:3, **exactly 4 columns × 3 rows** (12 square cells), seamless charcoal `#202126` background, dish centred in each cell at ~70% cell width, 35° elevated angle, studio lighting, no text/props/hands.
- Row-major id order: sheet 0 = ids 200–211, sheet 1 = 212–223, sheet 2 = 224–235, sheet 3 = 236–239 (fill remaining 8 cells with any of the earlier dishes or leave blank charcoal — code only reads the first 4).
- Encode: `cwebp -q 88 sheet.png -o public/food-feast-N.webp`
- Generated illustrations, not restaurant photos.

## Dish order (row-major, id → dish)

Order is exactly `entries[]` in `lib/feast-foods.ts`; regenerate this table if that array changes.

- **Sheet 0** (`food-feast-0`, ids 200–211): 200 Rau muống xào tỏi · 201 Đậu phụ tẩm hành · 202 Khoai tây chiên · 203 Xôi gấc & xôi xéo · 204 Cơm rang thập cẩm · 205 Nem rán · 206 Canh chua cá · 207 Gỏi gà lá chanh · 208 Nộm sứa hoa chuối · 209 Bò cuốn lá lốt · 210 Gà hấp lá chanh · 211 Chả mực giã tay
- **Sheet 1** (`food-feast-1`, ids 212–223): 212 Lẩu nấm chay · 213 Gà rang muối · 214 Gà ủ muối hoa tiêu · 215 Lẩu gà lá é · 216 Gà nướng mật ong · 217 Chân giò hầm măng · 218 Lẩu gà nấm · 219 Bò hầm tiêu xanh & bánh mì · 220 Lẩu riêu cua bắp bò · 221 Cá chép om dưa · 222 Lẩu Thái tôm yum · 223 Lẩu bò nhúng giấm
- **Sheet 2** (`food-feast-2`, ids 224–235): 224 Sườn nướng BBQ tảng · 225 Cá diêu hồng hấp Hồng Kông · 226 Lẩu hải sản · 227 Mực nướng sa tế · 228 Bò nướng tảng · 229 Vịt quay Bắc Kinh · 230 Dê nướng ngũ vị · 231 Bê thui chấm tương · 232 Tôm hấp bia · 233 Cá lăng nướng riềng mẻ · 234 Lẩu cá tầm măng chua · 235 Baba om chuối đậu
- **Sheet 3** (`food-feast-3`, ids 236–239, first 4 cells only): 236 Cua rang me · 237 Ghẹ hấp bia · 238 Lẩu cua hoàng đế · 239 Tôm hùm nướng phô mai

## Wiring the atlas in

In [app/page.tsx](../app/page.tsx), replace the placeholder branch in `FoodImage`:

```tsx
function FoodImage({food}:{food:Food}){
 if(food.image>=200){
  const i=(food.image-200)%12, sheet=Math.floor((food.image-200)/12);
  return <div role="img" aria-label={food.name} className="food-image" style={{
   backgroundImage:`url(${basePath}/food-feast-${sheet}.webp)`,
   backgroundSize:'400% 300%',
   backgroundPosition:`${i%4/3*100}% ${[0,50,100][Math.floor(i/4)]}%`,
  }}/>;
 }
 // …existing lunch atlases
}
```

Then delete `FeastPlaceholder` and the `.feast-placeholder` rule in [app/globals.css](../app/globals.css). Keep a small bottom clip (`inset(0 0 4% 0)`) if a neighbouring row edge shows, as with `food-common`.

## Generation prompt

> Create a photorealistic food sprite atlas for a Vietnamese party-feast roulette game. Landscape 4:3 image, exactly FOUR equal columns by THREE equal rows (12 square cells), seamless solid charcoal #202126 background. Each cell one shared party dish or hotpot centred at exact cell centre, photographed at 35 degree elevated angle, taking ~70% of cell width with generous margin; nothing crosses cell boundaries. Crisp realistic food, consistent studio lighting, no text, numbers, labels, dividers, cutlery, hands or decoration outside dishes. EXACT row-major order — sheet 0: (1) Vietnamese garlic stir-fried water spinach on a large plate; (2) fried tofu topped with scallion oil; (3) a big bowl of French fries; (4) Vietnamese sticky rice, red gac rice and turmeric xoi xeo on a bamboo tray; (5) large plate of Vietnamese mixed fried rice; (6) a platter of Vietnamese fried spring rolls (nem ran); (7) a clay pot of Vietnamese sweet-and-sour fish soup (canh chua); (8) Vietnamese shredded chicken salad with lime leaves; (9) jellyfish and banana-blossom salad; (10) grilled beef in wild betel leaves (bo la lot) on a plate; (11) whole steamed chicken with lime leaves, chopped; (12) pan-fried cuttlefish cakes (cha muc). [Repeat the same instructions for sheets 1–3 using ids 212–239 from the table above; sheet 3 only needs the first 4 cells filled.] Uniform scale, even exact 4x3 grid alignment, each entire dish visible.

Built-in imagegen tool or equivalent. Record the source path + dimensions + byte size here after generating, like `docs/common-food-assets.md`.
