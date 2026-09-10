import type { Food } from './foods';

// Party / shared dishes for a group of ~10. `price` is an approximate per-person
// feast rate in thousands of VND (order several shared plates + a hotpot), not a
// restaurant quote. Feast rates run higher than an everyday lunch, so the rarity
// bands are widened here instead of reusing the lunch thresholds.
export function feastRarity(priceInThousands: number) {
  return priceInThousands <= 150 ? 0
    : priceInThousands <= 220 ? 1
    : priceInThousands <= 300 ? 2
    : priceInThousands <= 400 ? 3
    : 4;
}

// Image ids start at 200: a dedicated `food-feast-*` atlas range. Until those
// sheets are generated (see docs/feast-assets.md) FoodImage renders a placeholder
// platter for any id >= 200.
const FEAST_IMAGE_BASE = 200;

type FeastEntry = Omit<Food, 'rarity' | 'image'>;

const entries: FeastEntry[] = [
  { name: 'Rau muống xào tỏi', price: 85, sub: 'Đĩa lớn chia mâm • Việt Nam', veg: true, quip: 'Món gọi thêm mà hết đầu tiên.' },
  { name: 'Đậu phụ tẩm hành', price: 85, sub: 'Đĩa lớn chia mâm • Việt Nam', veg: true, quip: 'Rẻ, nhanh, không bao giờ thừa.' },
  { name: 'Khoai tây chiên', price: 90, sub: 'Phần lớn cho cả nhóm', veg: true, quip: 'Mồi nhắm quốc dân của mọi bàn.' },
  { name: 'Xôi gấc & xôi xéo', price: 90, sub: 'Mẹt xôi cho 10 người', veg: true, quip: 'Ăn cho chắc bụng trước khi vào tiệc.' },
  { name: 'Cơm rang thập cẩm', price: 110, sub: 'Đĩa lớn cuối tiệc', quip: 'Chốt hạ khi lẩu đã cạn.' },
  { name: 'Nem rán', price: 120, sub: 'Mẹt 30 chiếc • Việt Nam', quip: 'Cuốn nào cũng phải có đĩa này.' },
  { name: 'Canh chua cá', price: 120, sub: 'Nồi lớn chia bát • Việt Nam', quip: 'Nồi canh giải rượu giữa tiệc.' },
  { name: 'Gỏi gà lá chanh', price: 140, sub: 'Đĩa lớn trộn sẵn • Việt Nam', quip: 'Khai vị mà ai cũng gắp hai lần.' },
  { name: 'Nộm sứa hoa chuối', price: 145, sub: 'Đĩa lớn chia mâm • Việt Nam', quip: 'Giòn sần sật, mở màn cho cả bàn.' },
  { name: 'Bò cuốn lá lốt', price: 150, sub: 'Mẹt 30 cuốn • Việt Nam', quip: 'Nướng tới đâu hết tới đó.' },
  { name: 'Gà hấp lá chanh', price: 150, sub: 'Nguyên con chặt miếng • Việt Nam', quip: 'Con gà nằm giữa, cả nhóm vây quanh.' },
  { name: 'Chả mực giã tay', price: 155, sub: 'Đĩa lớn • Hạ Long', quip: 'Đắt xắt ra miếng, đúng nghĩa.' },
  { name: 'Lẩu nấm chay', price: 160, sub: 'Nồi lớn cho 10 người', veg: true, quip: 'Ăn chay nhưng chiến hết mình.' },
  { name: 'Gà rang muối', price: 170, sub: 'Nguyên con chặt miếng • Món Hoa', quip: 'Mặn mà, đưa bia số một.' },
  { name: 'Gà ủ muối hoa tiêu', price: 175, sub: 'Nguyên con • Món Hoa', quip: 'Da vàng ươm, thịt ngọt lịm.' },
  { name: 'Lẩu gà lá é', price: 180, sub: 'Nồi lớn cho 10 người • Phú Yên', quip: 'Nồi lẩu sôi thì cả nhóm mới yên.' },
  { name: 'Gà nướng mật ong', price: 185, sub: 'Nguyên con • Việt Nam', quip: 'Cánh gà biến mất trước khi lên hình.' },
  { name: 'Chân giò hầm măng', price: 190, sub: 'Nồi lớn chia bát • Việt Nam', quip: 'Món cỗ, ăn là thấy Tết.' },
  { name: 'Lẩu gà nấm', price: 195, sub: 'Nồi lớn cho 10 người', quip: 'An toàn, ai cũng ăn được.' },
  { name: 'Bò hầm tiêu xanh & bánh mì', price: 200, sub: 'Nồi lớn + rổ bánh mì', quip: 'Chấm bánh mì, đừng chấm công muộn.' },
  { name: 'Lẩu riêu cua bắp bò', price: 205, sub: 'Nồi lớn cho 10 người • Hà Nội', quip: 'Riêu cua nổi gạch là tiệc bắt đầu.' },
  { name: 'Cá chép om dưa', price: 210, sub: 'Nồi lớn chia mâm • Việt Nam', quip: 'Món nhậu kinh điển của hội bạn.' },
  { name: 'Lẩu Thái tôm yum', price: 215, sub: 'Nồi lớn cho 10 người • Thái Lan', quip: 'Chua cay đánh thức cả bàn.' },
  { name: 'Lẩu bò nhúng giấm', price: 230, sub: 'Nồi lớn + mẹt bánh tráng • Việt Nam', quip: 'Cuốn tới đâu, chuyện rôm tới đó.' },
  { name: 'Sườn nướng BBQ tảng', price: 240, sub: 'Mẹt sườn cho cả nhóm', quip: 'Cầm tay mà gặm, khỏi khách sáo.' },
  { name: 'Cá diêu hồng hấp Hồng Kông', price: 245, sub: 'Nguyên con • Món Hoa', quip: 'Có con cá to là mâm sang hẳn.' },
  { name: 'Lẩu hải sản', price: 250, sub: 'Nồi lớn cho 10 người', quip: 'Tôm mực nghêu thả tẹt ga.' },
  { name: 'Mực nướng sa tế', price: 255, sub: 'Mẹt lớn • Việt Nam', quip: 'Khói bay mù mịt, mùi bay khắp phố.' },
  { name: 'Bò nướng tảng', price: 265, sub: 'Tảng bò cắt tại bàn • Món Âu', quip: 'Dao kéo ra tay, cả nhóm trầm trồ.' },
  { name: 'Vịt quay Bắc Kinh', price: 270, sub: 'Nguyên con thái lát + bánh • Món Hoa', quip: 'Cuốn bánh, chấm tương, hết bài.' },
  { name: 'Dê nướng ngũ vị', price: 275, sub: 'Mẹt lớn • Ninh Bình', quip: 'Đặc sản đãi khách phương xa.' },
  { name: 'Bê thui chấm tương', price: 285, sub: 'Đĩa lớn thái mỏng • Nghệ An', quip: 'Chấm tương gừng là đúng bài.' },
  { name: 'Tôm hấp bia', price: 290, sub: 'Mẹt tôm cho cả nhóm', quip: 'Bóc tôm nhanh tay kẻo hết.' },
  { name: 'Cá lăng nướng riềng mẻ', price: 300, sub: 'Nguyên con • Tây Bắc', quip: 'Cá sông nướng than, mùi bay ba dãy nhà.' },
  { name: 'Lẩu cá tầm măng chua', price: 330, sub: 'Nồi lớn cho 10 người • Sa Pa', quip: 'Cá tầm mà, sang từ nồi lẩu.' },
  { name: 'Baba om chuối đậu', price: 350, sub: 'Nồi lớn chia mâm • Việt Nam', quip: 'Món độc, kể lại còn thấy oách.' },
  { name: 'Cua rang me', price: 370, sub: 'Mẹt cua cho cả nhóm', quip: 'Mút càng quên cả deadline.' },
  { name: 'Ghẹ hấp bia', price: 420, sub: 'Mẹt ghẹ cho cả nhóm • Cát Bà', quip: 'Đắt nhưng liên hoan mà, chơi luôn.' },
  { name: 'Lẩu cua hoàng đế', price: 460, sub: 'Nồi lớn • hải sản cao cấp', quip: 'Drop huyền thoại. Quỹ nhóm bay màu.' },
  { name: 'Tôm hùm nướng phô mai', price: 480, sub: 'Mẹt tôm hùm • hải sản cao cấp', quip: 'Chốt kèo này thì cả năm nhắc lại.' },
];

export const feastFoods: Food[] = entries.map((food, i) => ({
  ...food,
  image: FEAST_IMAGE_BASE + i,
  rarity: feastRarity(food.price),
}));
