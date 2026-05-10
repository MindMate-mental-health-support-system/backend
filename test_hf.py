from gradio_client import Client, handle_file

print("Setting up Text Emotion Client...")
try:
    text_client = Client("sidharths9105/mindmate-emotion-detector")
    print("\nText Emotion APIs:")
    text_client.view_api()
    res = text_client.predict("I am very happy today", api_name="/predict")
    print("Text Prediction Result (English):", res)
    res = text_client.predict("എനിക്ക് ഇന്ന് വളരെ സന്തോഷമുണ്ട്", api_name="/predict")
    print("Text Prediction Result (Malayalam):", res)
    res = text_client.predict("मैं आज बहुत खुश हूँ", api_name="/predict")
    print("Text Prediction Result (Hindi):", res)
except Exception as e:
    print("Error with Text Emotion Detector:", e)

print("\n--------------------------\n")
print("Setting up Speech Emotion Client...")
try:
    speech_client = Client("sidharths9105/mindmate-ser")
    print("\nSpeech Emotion APIs:")
    speech_client.view_api()
except Exception as e:
    print("Error with Speech Emotion Detector:", e)
