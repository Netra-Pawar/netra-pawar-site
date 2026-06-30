from mistralai import Mistral

client = Mistral()
response = client.chat.complete(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Explain the concept of an API in one simple sentence."}]
)
print(response.choices[0].message.content)