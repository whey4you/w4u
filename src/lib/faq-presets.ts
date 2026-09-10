import { ProductFAQ } from '@/types/product';

export interface FAQCategoryPreset {
  id: string;
  name: string;
  icon: string;
  items: ProductFAQ[];
}

export const FAQ_PRESETS: FAQCategoryPreset[] = [
  {
    id: 'whey',
    name: 'Whey Protein',
    icon: '🥛',
    items: [
      {
        question: 'Whey Protein có tác dụng gì?',
        answer: 'Whey Protein giúp bổ sung protein nhanh chóng, hỗ trợ phục hồi và phát triển cơ bắp, đặc biệt phù hợp với người tập gym, chơi thể thao hoặc khó bổ sung đủ protein từ thực phẩm.',
      },
      {
        question: 'Nên uống Whey Protein khi nào?',
        answer: 'Bạn có thể uống sau khi tập, vào buổi sáng hoặc giữa các bữa ăn. Quan trọng nhất là đảm bảo tổng lượng protein cần thiết trong ngày.',
      },
      {
        question: 'Uống Whey Protein mỗi ngày có được không?',
        answer: 'Có. Whey có thể sử dụng hằng ngày như một nguồn bổ sung protein nếu bạn không đáp ứng đủ nhu cầu từ chế độ ăn thông thường.',
      },
    ],
  },
  {
    id: 'creatine',
    name: 'Creatine',
    icon: '💪',
    items: [
      {
        question: 'Creatine có tác dụng gì?',
        answer: 'Creatine giúp tăng khả năng tạo năng lượng cho cơ bắp trong các hoạt động cường độ cao, hỗ trợ cải thiện sức mạnh, hiệu suất tập luyện và tăng khối lượng cơ theo thời gian.',
      },
      {
        question: 'Nên uống Creatine trước hay sau tập?',
        answer: 'Thời điểm sử dụng không quá quan trọng. Điều quan trọng là duy trì đều đặn mỗi ngày, thường khoảng 3–5g/ngày.',
      },
      {
        question: 'Có cần ngưng Creatine theo chu kỳ không?',
        answer: 'Thông thường không cần. Creatine có thể được sử dụng liên tục nếu dùng đúng liều lượng phù hợp.',
      },
    ],
  },
  {
    id: 'vitamins',
    name: 'Vitamins & Khoáng Chất',
    icon: '💊',
    items: [
      {
        question: 'Multivitamin có tác dụng gì?',
        answer: 'Multivitamin giúp bổ sung các vitamin và khoáng chất cần thiết mà chế độ ăn hàng ngày có thể chưa cung cấp đầy đủ, hỗ trợ sức khỏe tổng thể và quá trình chuyển hóa năng lượng.',
      },
      {
        question: 'Nên uống vitamin vào thời điểm nào?',
        answer: 'Thông thường nên uống cùng hoặc sau bữa ăn để hấp thu tốt hơn và hạn chế cảm giác khó chịu ở dạ dày.',
      },
      {
        question: 'Người tập gym có cần sử dụng vitamin không?',
        answer: 'Vitamin không bắt buộc nếu chế độ ăn đã đầy đủ, nhưng có thể hữu ích đối với người tập luyện nhiều, ăn kiêng hoặc có chế độ dinh dưỡng chưa đa dạng.',
      },
    ],
  },
  {
    id: 'preworkout',
    name: 'Pre-Workout',
    icon: '⚡',
    items: [
      {
        question: 'Pre-Workout có tác dụng gì?',
        answer: 'Pre-Workout thường được sử dụng để hỗ trợ tăng năng lượng, sự tập trung và hiệu suất trong quá trình tập luyện.',
      },
      {
        question: 'Nên uống Pre-Workout trước tập bao lâu?',
        answer: 'Thông thường nên sử dụng khoảng 20–30 phút trước khi tập để các thành phần có thời gian phát huy tác dụng.',
      },
      {
        question: 'Có nên uống Pre-Workout vào buổi tối không?',
        answer: 'Nếu sản phẩm chứa caffeine, nên hạn chế sử dụng gần giờ ngủ vì có thể ảnh hưởng đến chất lượng giấc ngủ. Với người nhạy caffeine, nên ưu tiên dùng vào buổi sáng hoặc chiều sớm.',
      },
    ],
  },
];
