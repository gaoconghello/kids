import { generateText, streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 调用LLM模型并处理响应
 * @param {Object} options - 配置选项
 * @param {string} options.content - 用户输入的内容
 * @param {string} options.systemPrompt - 系统提示信息
 * @param {string} [options.modelName='THUDM/glm-4-9b-chat'] - 模型名称
 * @param {boolean} [options.isPrint=true] - 是否打印输出
 * @param {boolean} [options.stream=false] - 是否返回流式响应
 * @param {number} [options.temperature=0.1] - 温度参数，控制输出的随机性
 * @returns {Promise<string|Object>} - 返回LLM的完整响应或流对象
 */
async function invokeLlm({ content, systemPrompt, modelName = 'THUDM/glm-4-9b-chat', isPrint = true, stream = false, temperature = 0.1 }) {
  const LLM_API_KEY = process.env.LLM_API_KEY;

  // 创建 OpenRouter 提供商适配器
  const openrouter = createOpenRouter({
    apiKey: LLM_API_KEY,
  });

  try {
    // 如果需要流式返回
    if (stream) {
      // 使用streamText返回流对象
      const { textStream } = streamText({
        model: openrouter(modelName),
        system: systemPrompt,
        prompt: content,
        temperature: temperature,
      });
      
      // 如果需要打印输出，可以设置一个事件监听器
      if (isPrint) {
        (async () => {
          for await (const chunk of textStream) {
            process.stdout.write(chunk);
          }
        })();
      }
      
      // 返回流对象，供调用者使用
      return textStream;
    } else {
      // 原有的非流式处理方式
      let result = '';
      await generateText({
        model: openrouter(modelName),
        system: systemPrompt,
        prompt: content,
        temperature: temperature,
        onTextContent: (content) => {
          if (isPrint) {
            process.stdout.write(content);
          }
          result += content;
        },
      });
      
      return result;
    }
  } catch (error) {
    console.error('调用 AI 时出错:', error);
    if (error.message.includes('API key')) {
      console.error('请确保已正确设置 LLM_API_KEY 环境变量。');
    }
    throw error;
  }
}

export default invokeLlm;
