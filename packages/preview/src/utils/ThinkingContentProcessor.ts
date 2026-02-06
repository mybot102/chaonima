/**
 * 思考内容处理器
 * 用于处理流式输出中包含 <think>...</think> 标签的情况
 */
export class ThinkingContentProcessor {
  private isThinking = false;
  private buffer = '';
  private onChunk: (text: string) => void;
  private onThinking?: (text: string) => void;

  constructor(onChunk: (text: string) => void, onThinking?: (text: string) => void) {
    this.onChunk = onChunk;
    this.onThinking = onThinking;
  }

  process(content: string) {
    this.buffer += content;
    
    while (true) {
      if (!this.isThinking) {
        // 查找 <think> 开始标签
        const thinkStart = this.buffer.indexOf('<think>');
        if (thinkStart !== -1) {
          // 发送标签前的内容
          if (thinkStart > 0) {
            this.onChunk(this.buffer.slice(0, thinkStart));
          }
          // 切换状态
          this.isThinking = true;
          this.buffer = this.buffer.slice(thinkStart + 7); // <think> 长度为 7
        } else {
          // 检查缓冲区末尾是否有部分标签
          const partialMatch = this.findPartialTag(this.buffer, '<think>');
          if (partialMatch > 0) {
            // 发送非部分匹配的内容
            const safeContent = this.buffer.slice(0, this.buffer.length - partialMatch);
            if (safeContent) this.onChunk(safeContent);
            this.buffer = this.buffer.slice(this.buffer.length - partialMatch);
            break; // 等待更多数据
          } else {
            // 没有标签，全部发送
            if (this.buffer) this.onChunk(this.buffer);
            this.buffer = '';
            break;
          }
        }
      } else {
        // 在思考模式中，查找 </think> 结束标签
        const thinkEnd = this.buffer.indexOf('</think>');
        if (thinkEnd !== -1) {
          // 发送思考内容
          if (thinkEnd > 0 && this.onThinking) {
            this.onThinking(this.buffer.slice(0, thinkEnd));
          }
          // 切换状态
          this.isThinking = false;
          this.buffer = this.buffer.slice(thinkEnd + 8); // </think> 长度为 8
        } else {
          // 检查缓冲区末尾是否有部分标签 </think>
          const partialMatch = this.findPartialTag(this.buffer, '</think>');
          if (partialMatch > 0) {
            // 发送安全部分
            const safeContent = this.buffer.slice(0, this.buffer.length - partialMatch);
            if (safeContent && this.onThinking) this.onThinking(safeContent);
            this.buffer = this.buffer.slice(this.buffer.length - partialMatch);
            break;
          } else {
            // 全部发送
            if (this.buffer && this.onThinking) this.onThinking(this.buffer);
            this.buffer = '';
            break;
          }
        }
      }
    }
  }

  flush() {
    if (this.buffer) {
      if (this.isThinking) {
        if (this.onThinking) this.onThinking(this.buffer);
      } else {
        this.onChunk(this.buffer);
      }
      this.buffer = '';
    }
  }

  // 返回匹配的前缀长度
  private findPartialTag(text: string, tag: string): number {
    // 从最长可能的前缀开始检查
    for (let i = tag.length - 1; i > 0; i--) {
      if (text.endsWith(tag.slice(0, i))) {
        return i;
      }
    }
    return 0;
  }
}
