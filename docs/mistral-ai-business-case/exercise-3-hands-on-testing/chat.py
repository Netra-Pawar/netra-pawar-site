import os
from mistralai.client import Mistral

# Set API key directly (for testing only)
os.environ["MISTRAL_API_KEY"] = "YOUR_MISTRAL_API_KEY"

# Get API key from environment variable
api_key = os.environ.get("MISTRAL_API_KEY")

client = Mistral()
response = client.chat.complete(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Explain the concept of an API in one simple sentence."}]
)
print(response.choices[0].message.content)