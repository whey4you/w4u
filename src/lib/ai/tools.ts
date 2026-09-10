import { z } from 'zod';
import { searchInternet } from './search-service';
import { searchShopProducts } from './product-catalog';

const querySchema = z.object({
  query: z.string().trim().min(2).max(200),
}).strict();

/**
 * Định nghĩa Tool calling chuẩn Mistral API với phân định rõ ràng
 */
export const MISTRAL_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description:
        'BẮT BUỘC dùng để tra cứu thông tin thực tế khi người dùng hỏi về: Vận động viên, IFBB Pro, KOL gym, HLV (vd: Đăng Béo, An Nguyễn, Chris Bumstead...), giải đấu, tin tức mới, hoặc kiến thức thể thao ngoài phạm vi kho hàng shop. Hãy luôn đính kèm mốc năm hiện tại (vd: 2026, mới nhất) vào câu query để luôn nhận được kết quả cập nhật nhất, tránh tài liệu cũ.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Từ khóa tìm kiếm chính xác kèm mốc thời gian nếu cần (vd: "IFBB Pro Đăng Béo mới nhất 2026", "An Nguyễn Fitness 2026", "giải đấu Olympia 2026")',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_shop_products',
      description:
        'Dùng để tìm kiếm sản phẩm trong shop Whey4You (Whey Protein, Mass Gainer, Creatine, Vitamin...). Hãy gọi công cụ này khi khách hỏi mua, hỏi giá, hỏi tồn kho, HOẶC khi tư vấn giải pháp dinh dưỡng theo mục tiêu (tăng cơ, giảm mỡ, tăng cân, sức mạnh) để có sản phẩm giới thiệu ở cuối câu trả lời.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Tên sản phẩm, thương hiệu hoặc mục tiêu cần tìm (vd: "Rule 1", "ISO 100", "tăng cân", "tăng cơ", "creatine")',
          },
        },
        required: ['query'],
      },
    },
  },
];

/**
 * Thực thi tool và trả về dữ liệu chuẩn xác cho AI tổng hợp
 */
export async function executeAITool(toolName: string, argsRaw: string, signal?: AbortSignal): Promise<string> {
  let parsedArgs: z.infer<typeof querySchema>;
  try {
    const raw = JSON.parse(argsRaw);
    parsedArgs = querySchema.parse(raw);
  } catch {
    return JSON.stringify({ status: 'invalid_arguments' });
  }

  if (toolName === 'search_shop_products') {
    try {
      const products = await searchShopProducts(parsedArgs.query, signal);
      return JSON.stringify({ status: 'ok', products });
    } catch {
      return JSON.stringify({ status: 'error' });
    }
  }

  if (toolName === 'web_search') {
    try {
      const outcome = await searchInternet(parsedArgs.query, 4, signal);
      return JSON.stringify(outcome);
    } catch {
      return JSON.stringify({ status: 'error', results: [] });
    }
  }

  return JSON.stringify({ status: 'error', message: `Unknown tool: ${toolName}` });
}
