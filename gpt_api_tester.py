import openai
import time
from typing import Optional, List

class GPTAPITester:
    def __init__(self, api_key: str):
        openai.api_key = api_key
        self.max_retries = 3
        self.retry_delay = 1  # seconds

    def get_completion(self, 
                      prompt: str, 
                      model: str = "gpt-3.5-turbo",
                      temperature: float = 0.7,
                      max_tokens: int = 2000,
                      previous_response: Optional[str] = None) -> str:
        """
        GPT API를 호출하여 응답을 받아옵니다.
        응답이 중간에 끊기면 자동으로 재시도합니다.
        """
        messages = []
        if previous_response:
            messages.append({"role": "assistant", "content": previous_response})
        messages.append({"role": "user", "content": prompt})

        for attempt in range(self.max_retries):
            try:
                response = openai.ChatCompletion.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    stream=False  # streaming을 False로 설정하여 완전한 응답을 받습니다
                )
                
                full_response = response.choices[0].message.content
                
                # 응답이 완전한지 확인 (예: 마지막 문장이 완료되었는지)
                if full_response.strip().endswith(('.', '!', '?')):
                    return full_response
                
                # 응답이 완전하지 않으면 재시도
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                    
            except Exception as e:
                print(f"Error on attempt {attempt + 1}: {str(e)}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                raise

        return full_response  # 모든 재시도 후에도 완전하지 않은 응답을 반환

    def get_streaming_completion(self, 
                               prompt: str, 
                               model: str = "gpt-3.5-turbo",
                               temperature: float = 0.7,
                               max_tokens: int = 2000) -> str:
        """
        스트리밍 방식으로 GPT API를 호출하여 응답을 받아옵니다.
        """
        messages = [{"role": "user", "content": prompt}]
        full_response = ""
        
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    full_response += chunk.choices[0].delta.content
                    
        except Exception as e:
            print(f"Error during streaming: {str(e)}")
            
        return full_response

# 사용 예시
if __name__ == "__main__":
    api_key = "your-api-key-here"
    tester = GPTAPITester(api_key)
    
    # 일반적인 완료 요청
    prompt = "다음 주제에 대해 자세히 설명해주세요: 인공지능의 미래"
    response = tester.get_completion(prompt, temperature=0.7)
    print("일반 응답:", response)
    
    # 스트리밍 방식 요청
    streaming_response = tester.get_streaming_completion(prompt, temperature=0.7)
    print("스트리밍 응답:", streaming_response) 